import { expect, request, test } from "@playwright/test";
import type { Page } from "@/lib/pages";
import type { Skill } from "@/lib/skills";

test("should open the Expertise page", async ({ page }) => {
	const reqCtx = await request.newContext({
		baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
	});
	// fetch page from the API
	const pagesResponse = await reqCtx.get(`/api/pages?filters[slug]=expertise`);
	const { data: pages } = (await pagesResponse.json()) as { data: Page[] };

	// fetch skills data from the API
	const skillsResponse = await reqCtx.get("/api/skills");
	const { data: skills } = (await skillsResponse.json()) as { data: Skill[] };

	// Open the page
	await page.goto("/expertise");

	// Check that the subtitle is correct
	await expect(page.locator("h1")).toContainText(pages[0].attributes.subtitle);

	// Check that the skills are displayed
	for (const skill of skills) {
		await expect(
			page.locator(`h2:has-text("${skill.attributes.name}")`),
		).toBeVisible();
	}
});
