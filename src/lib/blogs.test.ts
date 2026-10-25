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

const strapiPage = (
	data: ReturnType<typeof blog>[],
	start: number,
	limit: number,
	total: number,
) => ({ data, meta: { pagination: { start, limit, total } } });

describe("blogs", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockedGetLocales.mockResolvedValue(["en", "vi"]);
		mockedFetchEntries.mockResolvedValue({ entries: [], total: 0 } as never);
		mockedFetchAPI.mockResolvedValue(strapiPage([], 0, 25, 0) as never);
	});

	it("getBlog looks the slug up across every locale in one request", async () => {
		const post = blog("xin-chao", "2026-02-01T00:00:00.000Z");
		mockedFetchAPI.mockResolvedValue(strapiPage([post], 0, 25, 1) as never);

		const result = await getBlog("xin-chao");

		expect(mockedFetchAPI).toHaveBeenCalledTimes(1);
		expect(mockedFetchAPI).toHaveBeenCalledWith(
			"/blogs",
			expect.objectContaining({
				filters: { slug: "xin-chao" },
				locale: "*",
			}),
			{ next: { tags: ["blog-xin-chao"] } },
		);
		expect(result).toEqual(post);
	});

	it("getBlog returns undefined when no locale has the slug", async () => {
		const result = await getBlog("missing");

		expect(mockedFetchAPI).toHaveBeenCalledTimes(1);
		expect(result).toBeUndefined();
	});

	it("getBlogs asks Strapi for one page of every locale, newest first", async () => {
		const page = strapiPage(
			[
				blog("e1", "2026-03-01T00:00:00.000Z"),
				blog("v1", "2026-02-01T00:00:00.000Z"),
			],
			0,
			2,
			3,
		);
		mockedFetchAPI.mockResolvedValue(page as never);

		const result = await getBlogs(0, 2);

		expect(mockedFetchAPI).toHaveBeenCalledTimes(1);
		expect(mockedFetchAPI).toHaveBeenCalledWith("/blogs", {
			populate: ["seo", "seo.metaImage"],
			sort: "publishedAt:desc",
			locale: "*",
			pagination: { start: 0, limit: 2 },
		});
		expect(result).toEqual(page);
	});

	it("getBlogs lets Strapi skip to a later page", async () => {
		await getBlogs(20, 10);

		expect(mockedFetchAPI).toHaveBeenCalledWith(
			"/blogs",
			expect.objectContaining({ pagination: { start: 20, limit: 10 } }),
		);
	});

	it("getBlogs defaults to the first NEXT_PUBLIC_PAGE_SIZE posts", async () => {
		process.env.NEXT_PUBLIC_PAGE_SIZE = "12";

		await getBlogs();

		expect(mockedFetchAPI).toHaveBeenCalledWith(
			"/blogs",
			expect.objectContaining({ pagination: { start: 0, limit: 12 } }),
		);
	});

	it("getBlogSlugs delegates to getAllEntitySlugs", async () => {
		mockedGetAllEntitySlugs.mockResolvedValue(["a", "b"]);

		const result = await getBlogSlugs();

		expect(mockedGetAllEntitySlugs).toHaveBeenCalledWith("blogs");
		expect(result).toEqual(["a", "b"]);
	});
});
