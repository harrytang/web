import { getBlogs } from "@/lib/blogs";
import { getPublicSiteURL } from "@/lib/helper";
import { fetchAPI } from "@/lib/strapi";
import sitemap, { revalidate } from "./sitemap";

jest.mock("@/lib/helper", () => ({
	getPublicSiteURL: jest.fn(),
}));

jest.mock("@/lib/blogs", () => ({
	getBlogs: jest.fn(),
}));

jest.mock("@/lib/strapi", () => ({
	fetchAPI: jest.fn(),
}));

describe("sitemap route", () => {
	beforeEach(() => {
		(getPublicSiteURL as jest.Mock).mockReturnValue("https://example.com");
		(getBlogs as jest.Mock).mockResolvedValue({
			meta: { pagination: { total: 25 } },
		});

		(fetchAPI as jest.Mock)
			.mockResolvedValueOnce({
				data: [
					{
						attributes: {
							slug: "first-blog",
							updatedAt: "2026-01-05T00:00:00.000Z",
						},
					},
				],
			})
			.mockResolvedValueOnce({
				data: [
					{
						attributes: {
							slug: "projects",
							updatedAt: "2026-02-05T00:00:00.000Z",
						},
					},
				],
			});
	});

	it("exports expected revalidate value", () => {
		expect(revalidate).toBe(3600);
	});

	it("builds static, blog, page, and paginated article sitemap URLs", async () => {
		const result = await sitemap();

		expect(fetchAPI).toHaveBeenCalledTimes(2);
		expect(getBlogs).toHaveBeenCalledWith(0, 1);

		const pageSize = parseInt(process.env.NEXT_PUBLIC_PAGE_SIZE || "10", 10);
		const totalPages = Math.ceil(25 / pageSize);

		expect(result).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ url: "https://example.com/" }),
				expect.objectContaining({ url: "https://example.com/about" }),
				expect.objectContaining({ url: "https://example.com/blog/first-blog" }),
				expect.objectContaining({ url: "https://example.com/projects" }),
				expect.objectContaining({ url: "https://example.com/articles" }),
			]),
		);
		// 2 static pages + 1 blog + 1 project + totalPages article pages
		expect(result).toHaveLength(2 + 1 + 1 + totalPages);
	});

	it("uses default sitemap size when SITEMAP_SIZE is not set", async () => {
		delete process.env.SITEMAP_SIZE;
		(fetchAPI as jest.Mock).mockReset();
		(fetchAPI as jest.Mock)
			.mockResolvedValueOnce({ data: [] })
			.mockResolvedValueOnce({ data: [] });
		(getBlogs as jest.Mock).mockResolvedValueOnce({
			meta: { pagination: { total: 0 } },
		});

		await sitemap();

		expect(fetchAPI).toHaveBeenNthCalledWith(
			1,
			"/blogs",
			expect.objectContaining({
				pagination: { start: 0, limit: 1000 },
			}),
		);
		expect(fetchAPI).toHaveBeenNthCalledWith(
			2,
			"/pages",
			expect.objectContaining({
				pagination: { start: 0, limit: 1000 },
			}),
		);
	});
});
