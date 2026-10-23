import { expect, test } from "@playwright/test";
import type { Profile } from "@/lib/profile";
import { getLatestBlogs, newStrapiContext } from "./strapi";

test("should open the Home page", async ({ page }) => {
	// Fetch the profile data from the API
	const reqCtx = await newStrapiContext();
	const apiResponse = await reqCtx.get(
		"/api/profile?populate[0]=socials&populate[1]=photos",
	);
	const { data } = (await apiResponse.json()) as { data: Profile };

	// fetch blogs data from the API
	const blogs = await getLatestBlogs(
		reqCtx,
		parseInt(process.env.NEXT_PUBLIC_HOME_PAGE_SIZE ?? "6", 10),
	);

	// Open the page
	await page.goto("/");

	// Check that the title is correct
	await expect(page.locator("h1")).toContainText(data.attributes.title);

	// check the social links are displayed
	for (const social of data.attributes.socials) {
		expect(page.locator(`a[href="${social.href}"]`)).toBeDefined();
	}

	// check that the photos are displayed
	for (const photo of data.attributes.photos.data) {
		expect(
			page.locator(`img[alt="${photo.attributes.caption}"]`),
		).toBeDefined();
	}

	// Check that the blogs are displayed
	for (const blog of blogs) {
		await expect(
			page.locator(`h2:has-text("${blog.attributes.title}")`),
		).toBeVisible();
	}
});
