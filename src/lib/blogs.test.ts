import { getBlog, getBlogSlugs, getBlogs } from "./blogs";
import {
	fetchAPI,
	fetchEntries,
	getAllEntitySlugs,
	getLocales,
} from "./strapi";

jest.mock("./strapi", () => ({
	fetchAPI: jest.fn(),
	fetchEntries: jest.fn(),
	getAllEntitySlugs: jest.fn(),
	getLocales: jest.fn(),
}));

const mockedFetchAPI = jest.mocked(fetchAPI);
const mockedFetchEntries = jest.mocked(fetchEntries);
const mockedGetAllEntitySlugs = jest.mocked(getAllEntitySlugs);
const mockedGetLocales = jest.mocked(getLocales);

const blog = (slug: string, publishedAt: string) => ({
	id: 1,
	slug,
	publishedAt,
});

// newest first within each locale, as Strapi returns them for sort=publishedAt:desc
const postsByLocale: Record<string, ReturnType<typeof blog>[]> = {
	en: [
		blog("e1", "2026-03-01T00:00:00.000Z"),
		blog("e2", "2026-01-01T00:00:00.000Z"),
	],
	vi: [blog("v1", "2026-02-01T00:00:00.000Z")],
};

describe("blogs", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockedGetLocales.mockResolvedValue(["en", "vi"]);
		mockedFetchAPI.mockResolvedValue({
			data: [],
			meta: { pagination: { start: 0, limit: 25, total: 0 } },
		} as never);
		mockedFetchEntries.mockImplementation((async (
			_path: string,
			params: { locale: string },
			{ count }: { count: number },
		) => {
			const rows = postsByLocale[params.locale] ?? [];
			return { entries: rows.slice(0, count), total: rows.length };
		}) as never);
	});

	it("getBlog finds the post in whichever locale has the slug", async () => {
		mockedFetchAPI.mockImplementation((async (
			_path: string,
			params: { locale: string },
		) => ({
			data:
				params.locale === "vi"
					? [blog("xin-chao", "2026-02-01T00:00:00.000Z")]
					: [],
			meta: { pagination: { start: 0, limit: 25, total: 0 } },
		})) as never);

		const result = await getBlog("xin-chao");

		expect(mockedFetchAPI).toHaveBeenCalledTimes(2);
		expect(mockedFetchAPI).toHaveBeenCalledWith(
			"/blogs",
			expect.objectContaining({
				filters: { slug: "xin-chao" },
				locale: "vi",
			}),
			{ next: { tags: ["blog-xin-chao"] } },
		);
		expect(result).toEqual(blog("xin-chao", "2026-02-01T00:00:00.000Z"));
	});

	it("getBlog returns undefined when no locale has the slug", async () => {
		const result = await getBlog("missing");

		expect(mockedFetchAPI).toHaveBeenCalledTimes(2);
		expect(result).toBeUndefined();
	});

	it("getBlogs merges every locale, newest first", async () => {
		const result = await getBlogs(0, 2);

		expect(result.data.map((post) => post.slug)).toEqual(["e1", "v1"]);
		expect(result.meta.pagination).toEqual({ start: 0, limit: 2, total: 3 });
		expect(mockedFetchEntries).toHaveBeenCalledWith(
			"/blogs",
			expect.objectContaining({
				sort: "publishedAt:desc",
				locale: "vi",
			}),
			{ pageSize: 2, count: 2 },
		);
	});

	it("getBlogs paginates over the merged list", async () => {
		const result = await getBlogs(2, 2);

		expect(result.data.map((post) => post.slug)).toEqual(["e2"]);
		expect(result.meta.pagination).toEqual({ start: 2, limit: 2, total: 3 });
		expect(mockedFetchEntries).toHaveBeenCalledWith(
			"/blogs",
			expect.objectContaining({ locale: "en" }),
			{ pageSize: 4, count: 4 },
		);
	});

	it("getBlogs defaults to the first NEXT_PUBLIC_PAGE_SIZE posts", async () => {
		process.env.NEXT_PUBLIC_PAGE_SIZE = "12";

		const result = await getBlogs();

		expect(result.meta.pagination).toEqual({ start: 0, limit: 12, total: 3 });
		expect(mockedFetchEntries).toHaveBeenCalledWith(
			"/blogs",
			expect.any(Object),
			{ pageSize: 12, count: 12 },
		);
	});

	it("getBlogSlugs delegates to getAllEntitySlugs", async () => {
		mockedGetAllEntitySlugs.mockResolvedValue(["a", "b"]);

		const result = await getBlogSlugs();

		expect(mockedGetAllEntitySlugs).toHaveBeenCalledWith("blogs");
		expect(result).toEqual(["a", "b"]);
	});
});
