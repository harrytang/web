import { expect, request, test } from "@playwright/test";
import type { Blog } from "@/lib/blogs";

test.describe("Blog pages", () => {
	test("should open a blog detail page from API slug", async ({ page }) => {
		const reqCtx = await request.newContext({
			baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
		});
		const blogsResponse = await reqCtx.get(
			"/api/blogs?pagination[limit]=1&sort=publishedAt:desc&locale=all",
		);
		const { data: blogs } = (await blogsResponse.json()) as { data: Blog[] };
		await reqCtx.dispose();

		expect(blogs.length).toBeGreaterThan(0);
		const blog = blogs[0];

		await page.goto(`/blog/${blog.attributes.slug}`);

		await expect(page.locator("h1")).toContainText(blog.attributes.title);
		await expect(page.locator("article[lang]")).toBeVisible();
	});

	test("should show not found for unknown blog slug", async ({ page }) => {
		await page.goto("/blog/this-slug-should-not-exist-e2e");

		await expect(page.locator("h1")).toContainText("Page not found");
		await expect(
			page.getByRole("link", { name: "Go back home" }),
		).toBeVisible();
	});
});
