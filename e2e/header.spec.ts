import { expect, test } from "@playwright/test";

// The header is sticky: it must follow the reader down every page, not just the
// first screen. (It once scrolled away because the page wrapper was only one
// viewport tall.)
for (const path of ["/", "/articles"]) {
	test(`header stays at the top while scrolling ${path}`, async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto(path);

		const header = page.getByRole("banner");
		await expect(header).toBeVisible();

		// Scroll from script, not with the mouse wheel: WebKit drops wheel events
		// when it runs as the only worker, and the point here is the header, not
		// input delivery.
		await page.evaluate(() => window.scrollTo(0, 900));
		await expect
			.poll(() => page.evaluate(() => window.scrollY))
			.toBeGreaterThan(300);

		const box = await header.boundingBox();
		expect(box).not.toBeNull();
		expect(Math.round(box?.y ?? -1)).toBe(0);
		await expect(
			header.getByRole("link", { name: "Articles" }),
		).toBeInViewport();
	});
}

test("the phone menu dims the whole page, not just the header strip", async ({
	page,
}) => {
	await page.setViewportSize({ width: 390, height: 800 });
	await page.goto("/");

	await page.getByRole("button", { name: "Menu" }).click();

	// A backdrop-filter on the header once made it the containing block for the
	// menu's fixed backdrop, shrinking the overlay to the 64px header.
	const backdrop = page.locator("div.fixed.inset-0.z-50").first();
	await expect(backdrop).toBeVisible();
	const box = await backdrop.boundingBox();
	expect(box).not.toBeNull();
	expect(box?.height ?? 0).toBeGreaterThanOrEqual(790);
	expect(box?.width ?? 0).toBeGreaterThanOrEqual(385);
});

test("short pages still fill the screen, so the footer is not stranded mid-page", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1280, height: 900 });
	await page.goto("/this-page-does-not-exist-e2e");

	const footer = page.getByRole("contentinfo");
	await expect(footer).toBeVisible();
	const box = await footer.boundingBox();
	expect(box).not.toBeNull();
	// The footer sits at the bottom of the viewport, not under a blank gap.
	expect((box?.y ?? 0) + (box?.height ?? 0)).toBeGreaterThanOrEqual(850);
});
