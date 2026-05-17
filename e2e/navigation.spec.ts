import { expect, test } from "@playwright/test";

const menus = [
	{ name: "Home", path: "/" },
	{ name: "About", path: "/about" },
	{ name: "Articles", path: "/articles" },
	{ name: "Projects", path: "/projects" },
	{ name: "Expertise", path: "/expertise" },
	{ name: "Gear", path: "/gear" },
];

test.describe("Header navigation", () => {
	test("should render desktop navigation links", async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 900 });
		await page.goto("/");

		for (const menu of menus) {
			const link = page.locator(`nav >> a[href="${menu.path}"]`).first();
			await expect(link).toContainText(menu.name);
		}
	});

	test("should navigate between primary sections", async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 900 });
		await page.goto("/");

		await page.click('nav >> a[href="/about"]');
		await expect(page).toHaveURL(/\/about$/);
		await expect(page.locator("h1")).toBeVisible();

		await page.click('nav >> a[href="/projects"]');
		await expect(page).toHaveURL(/\/projects$/);
		await expect(page.locator("h1")).toBeVisible();

		await page.click('nav >> a[href="/articles"]');
		await expect(page).toHaveURL(/\/articles$/);
		await expect(page.locator("h1")).toBeVisible();
	});
});
