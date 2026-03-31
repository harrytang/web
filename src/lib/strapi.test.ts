import qs from "qs";
import { getStrapiURL } from "./helper";
import { fetchAPI, getAllEntitySlugs } from "./strapi";

jest.mock("qs", () => ({
	stringify: jest.fn(),
}));

jest.mock("./helper", () => ({
	getStrapiURL: jest.fn(),
}));

const mockedStringify = jest.mocked(qs.stringify);
const mockedGetStrapiURL = jest.mocked(getStrapiURL);

describe("strapi", () => {
	const originalFetch = global.fetch;

	beforeEach(() => {
		jest.clearAllMocks();
		mockedStringify.mockReturnValue("locale=all");
		mockedGetStrapiURL.mockImplementation(
			(path = "") => `https://cms.example${path}`,
		);
		global.fetch = jest.fn();
	});

	afterEach(() => {
		global.fetch = originalFetch;
	});

	it("fetchAPI builds url and returns json payload", async () => {
		Object.defineProperty(process.env, "NODE_ENV", { value: "production" });
		(global.fetch as jest.Mock).mockResolvedValue({
			ok: true,
			json: async () => ({
				data: [{ id: 1 }],
				meta: { pagination: { start: 0, limit: 1, total: 1 } },
			}),
		});

		const result = await fetchAPI<{ id: number }[]>("/blogs", {
			locale: "all",
		});

		expect(mockedStringify).toHaveBeenCalledWith({ locale: "all" });
		expect(mockedGetStrapiURL).toHaveBeenCalledWith("/api/blogs?locale=all");
		expect(global.fetch).toHaveBeenCalledWith(
			"https://cms.example/api/blogs?locale=all",
			expect.objectContaining({
				headers: { "Content-Type": "application/json" },
				cache: "force-cache",
			}),
		);
		expect(result.data).toEqual([{ id: 1 }]);
	});

	it("fetchAPI uses no-store cache in development", async () => {
		Object.defineProperty(process.env, "NODE_ENV", { value: "development" });
		(global.fetch as jest.Mock).mockResolvedValue({
			ok: true,
			json: async () => ({
				data: [],
				meta: { pagination: { start: 0, limit: 0, total: 0 } },
			}),
		});

		await fetchAPI("/pages", {});

		expect(global.fetch).toHaveBeenCalledWith(
			"https://cms.example/api/pages?locale=all",
			expect.objectContaining({ cache: "no-store" }),
		);
	});

	it("fetchAPI throws when response is not ok", async () => {
		const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
		(global.fetch as jest.Mock).mockResolvedValue({
			ok: false,
			statusText: "Bad Request",
		});

		await expect(fetchAPI("/broken")).rejects.toThrow(
			"An error occured please try again",
		);
		expect(errorSpy).toHaveBeenCalledWith("Bad Request");

		errorSpy.mockRestore();
	});

	it("getAllEntitySlugs paginates and concatenates all slugs", async () => {
		process.env.SITEMAP_SIZE = "2";
		mockedStringify
			.mockReturnValueOnce(
				"locale=all&pagination%5Blimit%5D=2&pagination%5Bstart%5D=0",
			)
			.mockReturnValueOnce(
				"locale=all&pagination%5Blimit%5D=2&pagination%5Bstart%5D=2",
			)
			.mockReturnValueOnce(
				"locale=all&pagination%5Blimit%5D=2&pagination%5Bstart%5D=4",
			);

		(global.fetch as jest.Mock)
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					data: [{ attributes: { slug: "a" } }, { attributes: { slug: "b" } }],
					meta: { pagination: { start: 0, limit: 2, total: 5 } },
				}),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					data: [{ attributes: { slug: "c" } }, { attributes: { slug: "d" } }],
					meta: { pagination: { start: 2, limit: 2, total: 5 } },
				}),
			})
			.mockResolvedValueOnce({
				ok: true,
				json: async () => ({
					data: [{ attributes: { slug: "e" } }],
					meta: { pagination: { start: 4, limit: 2, total: 5 } },
				}),
			});

		const result = await getAllEntitySlugs("blogs");

		expect(result).toEqual(["a", "b", "c", "d", "e"]);
		expect(global.fetch).toHaveBeenCalledTimes(3);
	});
});
