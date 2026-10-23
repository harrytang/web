import { expect, test } from "@playwright/test";
import type { Page } from "@/lib/pages";
import { getLatestBlogs, newStrapiContext } from "./strapi";

test("should open the Articles page", async ({ page }) => {
	const reqCtx = await newStrapiContext();
	// fetch page from the API
	const pagesResponse = await reqCtx.get(`/api/pages?filters[slug]=articles`);
	const { data: pages } = (await pagesResponse.json()) as { data: Page[] };

	// fetch blogs data from the API
	const blogs = await getLatestBlogs(
		reqCtx,
		parseInt(process.env.NEXT_PUBLIC_PAGE_SIZE ?? "10", 10),
	);

	// Open the page
	await page.goto(`/articles/1`);

	// Check that the subtitle is correct
	await expect(page.locator("h1")).toContainText(pages[0].attributes.subtitle);

	// Check that the blogs are displayed
	for (const blog of blogs) {
		await expect(
			page.locator(`h2:has-text("${blog.attributes.title}")`),
		).toBeVisible();
	}
});
