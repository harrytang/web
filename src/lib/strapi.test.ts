import qs from "qs";
import { getStrapiURL } from "./helper";
import { fetchAPI, fetchEntries, getAllEntitySlugs } from "./strapi";

jest.mock("qs", () => ({
	stringify: jest.fn(),
}));

jest.mock("./helper", () => ({
	getStrapiURL: jest.fn(),
}));

const mockedStringify = jest.mocked(qs.stringify);
const mockedGetStrapiURL = jest.mocked(getStrapiURL);
const realQs = jest.requireActual<typeof qs>("qs");

type SlugRow = { slug: string };

// Minimal Strapi REST API: rows per locale (locale=* reads them all), honouring start/limit
// and the api.rest.maxLimit cap
const fakeStrapi = (rowsByLocale: Record<string, SlugRow[]>, maxLimit = 100) =>
	jest.fn(async (url: string) => {
		const { search } = new URL(url);
		const params = realQs.parse(search.slice(1)) as {
			locale?: string;
			pagination?: { start?: string; limit?: string };
		};
		const rows =
			params.locale === "*"
				? Object.values(rowsByLocale).flat()
				: (rowsByLocale[params.locale ?? "en"] ?? []);
		const start = Number(params.pagination?.start ?? 0);
		const limit = Math.min(Number(params.pagination?.limit ?? 25), maxLimit);
		return {
			ok: true,
			json: async () => ({
				data: rows
					.slice(start, start + limit)
					.map((row, i) => ({ id: start + i + 1, ...row })),
				meta: { pagination: { start, limit, total: rows.length } },
			}),
		};
	});

const slugRows = (...slugs: string[]) => slugs.map((slug) => ({ slug }));

describe("strapi", () => {
	const originalFetch = global.fetch;

	beforeEach(() => {
		jest.clearAllMocks();
		mockedStringify.mockReturnValue("locale=en");
		mockedGetStrapiURL.mockImplementation(
			(path = "") => `https://cms.example${path}`,
		);
		global.fetch = jest.fn();
	});

	afterEach(() => {
		global.fetch = originalFetch;
	});

	const useFakeStrapi = (
		rowsByLocale: Record<string, SlugRow[]>,
		maxLimit?: number,
	) => {
		mockedStringify.mockImplementation(realQs.stringify);
		const fake = fakeStrapi(rowsByLocale, maxLimit);
		global.fetch = fake as unknown as typeof fetch;
		return fake;
	};

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
			locale: "en",
		});

		expect(mockedStringify).toHaveBeenCalledWith({ locale: "en" });
		expect(mockedGetStrapiURL).toHaveBeenCalledWith("/api/blogs?locale=en");
		expect(global.fetch).toHaveBeenCalledWith(
			"https://cms.example/api/blogs?locale=en",
			expect.objectContaining({
				headers: {
					"Content-Type": "application/json",
				},
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
			"https://cms.example/api/pages?locale=en",
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

	it("fetchAPI omits query string when params serialize empty", async () => {
		mockedStringify.mockReturnValue("");
		(global.fetch as jest.Mock).mockResolvedValue({
			ok: true,
			json: async () => ({
				data: [],
				meta: { pagination: { start: 0, limit: 0, total: 0 } },
			}),
		});

		await fetchAPI("/flat", {});

		expect(mockedGetStrapiURL).toHaveBeenCalledWith("/api/flat");
		expect(global.fetch).toHaveBeenCalledWith(
			"https://cms.example/api/flat",
			expect.any(Object),
		);
	});

	it("fetchEntries keeps paging when Strapi caps the page size", async () => {
		useFakeStrapi({ en: slugRows("a", "b", "c", "d", "e") }, 2);

		const result = await fetchEntries<SlugRow>(
			"/blogs",
			{ locale: "en" },
			{ pageSize: 5 },
		);

		expect(result.entries.map((entry) => entry.slug)).toEqual([
			"a",
			"b",
			"c",
			"d",
			"e",
		]);
		expect(result.total).toBe(5);
	});

	it("fetchEntries stops once it has count entries", async () => {
		const fake = useFakeStrapi({ en: slugRows("a", "b", "c", "d", "e") });

		const result = await fetchEntries<SlugRow>(
			"/blogs",
			{ locale: "en" },
			{ pageSize: 3, count: 3 },
		);

		expect(result.entries.map((entry) => entry.slug)).toEqual(["a", "b", "c"]);
		expect(result.total).toBe(5);
		expect(fake).toHaveBeenCalledTimes(1);
	});

	it("fetchEntries stops when a page comes back empty", async () => {
		mockedStringify.mockImplementation(realQs.stringify);
		(global.fetch as jest.Mock).mockResolvedValue({
			ok: true,
			json: async () => ({
				data: [],
				meta: { pagination: { start: 0, limit: 10, total: 10 } },
			}),
		});

		const result = await fetchEntries("/blogs", {}, { pageSize: 10 });

		expect(result).toEqual({ entries: [], total: 10 });
		expect(global.fetch).toHaveBeenCalledTimes(1);
	});

	it("getAllEntitySlugs collects slugs from every locale in one paginated query", async () => {
		process.env.SITEMAP_SIZE = "2";
		const fake = useFakeStrapi(
			{ en: slugRows("a", "b", "c"), vi: slugRows("d") },
			2,
		);

		const result = await getAllEntitySlugs("blogs");

		expect(result).toEqual(["a", "b", "c", "d"]);
		const requested = fake.mock.calls.map(([url]) => new URL(url));
		expect(requested.map((url) => url.pathname)).toEqual([
			"/api/blogs",
			"/api/blogs",
		]);
		expect(requested.map((url) => url.searchParams.get("locale"))).toEqual([
			"*",
			"*",
		]);
	});

	it("getAllEntitySlugs pages past the API cap with the default sitemap size", async () => {
		delete process.env.SITEMAP_SIZE;
		const slugs = Array.from({ length: 150 }, (_, i) => `post-${i}`);
		useFakeStrapi({ en: slugRows(...slugs) });

		const result = await getAllEntitySlugs("pages");

		expect(result).toEqual(slugs);
	});
});
