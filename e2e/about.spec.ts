import { expect, test } from "@playwright/test";
import type { Profile } from "@/lib/profile";
import { newStrapiContext } from "./strapi";

test("should open the About page", async ({ page }) => {
	// Fetch the profile data from the API
	const reqCtx = await newStrapiContext();
	const apiResponse = await reqCtx.get("/api/profile?populate[0]=socials");
	const { data } = (await apiResponse.json()) as { data: Profile };

	// Open the page
	await page.goto("/");

	// Check that the title is correct
	await expect(page.locator("h1")).toContainText(data.attributes.title);

	// check the social links are displayed
	for (const social of data.attributes.socials) {
		expect(page.locator(`a[href="${social.href}"]`)).toBeDefined();
	}
});
