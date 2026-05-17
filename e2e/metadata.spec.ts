import { expect, test } from "@playwright/test";

test.describe("Metadata endpoints", () => {
	test("should expose robots.txt with sitemap and api disallow", async ({
		page,
	}) => {
		const response = await page.goto("/robots.txt");
		expect(response?.ok()).toBeTruthy();

		const body = await page.textContent("body");
		expect(body).toContain("User-Agent: *");
		expect(body).toContain("Allow: /");
		expect(body).toContain("Disallow: /api/");
		expect(body).toContain("Sitemap:");
	});

	test("should expose sitemap.xml with core routes", async ({ page }) => {
		const response = await page.goto("/sitemap.xml");
		expect(response?.ok()).toBeTruthy();
		expect(response?.headers()["content-type"] || "").toContain("xml");

		const body = await page.textContent("body");
		expect(body).toContain("<urlset");
		expect(body).toContain("<loc>");
		expect(body).toContain("/about</loc>");
		expect(body).toContain("/articles</loc>");
	});
});
