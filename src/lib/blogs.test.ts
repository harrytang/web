import { getBlog, getBlogSlugs, getBlogs } from "./blogs";
import { fetchAPI, getAllEntitySlugs } from "./strapi";

jest.mock("./strapi", () => ({
	fetchAPI: jest.fn(),
	getAllEntitySlugs: jest.fn(),
}));

const mockedFetchAPI = jest.mocked(fetchAPI);
const mockedGetAllEntitySlugs = jest.mocked(getAllEntitySlugs);

describe("blogs", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("getBlog requests by slug and returns first blog", async () => {
		mockedFetchAPI.mockResolvedValue({
			data: [{ id: 1, attributes: { slug: "hello" } }],
			meta: { pagination: { start: 0, limit: 1, total: 1 } },
		} as never);

		const result = await getBlog("hello");

		expect(mockedFetchAPI).toHaveBeenCalledWith(
			"/blogs",
			expect.objectContaining({
				filters: { slug: "hello" },
				locale: "all",
			}),
			{ next: { tags: ["blog-hello"] } },
		);
		expect(result).toEqual({ id: 1, attributes: { slug: "hello" } });
	});

	it("getBlogs uses default pagination fallback values", async () => {
		process.env.NEXT_PUBLIC_PAGE_SIZE = "12";
		mockedFetchAPI.mockResolvedValue({
			data: [],
			meta: { pagination: { start: 0, limit: 12, total: 0 } },
		} as never);

		await getBlogs();

		expect(mockedFetchAPI).toHaveBeenCalledWith(
			"/blogs",
			expect.objectContaining({
				sort: "publishedAt:desc",
				locale: "all",
				pagination: {
					limit: "12",
					start: 0,
				},
			}),
		);
	});

	it("getBlogs respects provided start and limit", async () => {
		mockedFetchAPI.mockResolvedValue({
			data: [],
			meta: { pagination: { start: 5, limit: 3, total: 0 } },
		} as never);

		await getBlogs(5, 3);

		expect(mockedFetchAPI).toHaveBeenCalledWith(
			"/blogs",
			expect.objectContaining({
				pagination: {
					limit: 3,
					start: 5,
				},
			}),
		);
	});

	it("getBlogSlugs delegates to getAllEntitySlugs", async () => {
		mockedGetAllEntitySlugs.mockResolvedValue(["a", "b"]);

		const result = await getBlogSlugs();

		expect(mockedGetAllEntitySlugs).toHaveBeenCalledWith("blogs");
		expect(result).toEqual(["a", "b"]);
	});
});
