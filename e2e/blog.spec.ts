import { expect, test } from "@playwright/test";
import { getLatestBlogs, newStrapiContext } from "./strapi";

test.describe("Blog pages", () => {
	test("should open a blog detail page from API slug", async ({ page }) => {
		const reqCtx = await newStrapiContext();
		const blogs = await getLatestBlogs(reqCtx, 1);
		await reqCtx.dispose();

		expect(blogs.length).toBeGreaterThan(0);
		const blog = blogs[0];

		await page.goto(`/blog/${blog.attributes.slug}`);

		await expect(page.locator("h1")).toContainText(blog.attributes.title);
		await expect(page.locator("article[lang]")).toBeVisible();
	});

	test("should show not found for unknown blog slug", async ({ page }) => {
		const response = await page.goto("/blog/this-slug-should-not-exist-e2e");
		expect(response).not.toBeNull();
		expect(response?.status()).toBe(404);

		await expect(page.getByText("Page not found")).toBeVisible();
		await expect(
			page.getByRole("link", { name: "Go back home" }),
		).toBeVisible();
	});
});
