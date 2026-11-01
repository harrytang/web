import { expect, test } from "@playwright/test";
import type { Profile } from "@/lib/profile";
import { newStrapiContext } from "./strapi";

// The home page shows the profile photos as staggered tiles beside the headline.
const photoCaptions = async (): Promise<string[]> => {
	const reqCtx = await newStrapiContext();
	const apiResponse = await reqCtx.get("/api/profile?populate[0]=photos");
	const { data } = (await apiResponse.json()) as { data: Profile };
	return data.photos.map((photo) => photo.caption);
};

test.describe("Home photo tiles", () => {
	test("shows every profile photo", async ({ page }) => {
		const captions = await photoCaptions();
		expect(captions.length).toBeGreaterThan(0);

		await page.goto("/");

		for (const caption of captions) {
			await expect(page.locator(`img[alt="${caption}"]`)).toBeVisible();
		}
	});

	test("renders each photo with a source and dimensions", async ({ page }) => {
		const captions = await photoCaptions();
		await page.goto("/");

		for (const caption of captions) {
			const image = page.locator(`img[alt="${caption}"]`);
			expect(await image.getAttribute("src")).toBeTruthy();
			expect(
				parseInt((await image.getAttribute("width")) ?? "0", 10),
			).toBeGreaterThan(0);
			expect(
				parseInt((await image.getAttribute("height")) ?? "0", 10),
			).toBeGreaterThan(0);
		}
	});

	test("staggers the photos across three columns on desktop", async ({
		page,
	}) => {
		const captions = await photoCaptions();
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto("/");

		const lefts = new Set<number>();
		for (const caption of captions) {
			const box = await page
				.getByRole("img", { name: caption, exact: true })
				.first()
				.boundingBox();
			expect(box).not.toBeNull();
			lefts.add(Math.round(box?.x ?? 0));
		}
		expect(lefts.size).toBe(Math.min(3, captions.length));
	});

	test("keeps every photo fully on screen on a phone", async ({ page }) => {
		const captions = await photoCaptions();
		await page.setViewportSize({ width: 375, height: 812 });
		await page.goto("/");

		for (const caption of captions) {
			const box = await page
				.getByRole("img", { name: caption, exact: true })
				.first()
				.boundingBox();
			expect(box).not.toBeNull();
			expect(box?.x ?? -1).toBeGreaterThanOrEqual(0);
			expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(375);
		}
	});

	for (const width of [640, 768, 900, 1020]) {
		test(`never covers the intro text at ${width}px wide`, async ({ page }) => {
			const captions = await photoCaptions();
			await page.setViewportSize({ width, height: 900 });
			await page.goto("/");

			const lead = await page.locator("main h1 + p").boundingBox();
			expect(lead).not.toBeNull();
			for (const caption of captions) {
				const tile = await page
					.getByRole("img", { name: caption, exact: true })
					.first()
					.boundingBox();
				expect(tile).not.toBeNull();
				const overlaps =
					(tile?.x ?? 0) < (lead?.x ?? 0) + (lead?.width ?? 0) &&
					(tile?.x ?? 0) + (tile?.width ?? 0) > (lead?.x ?? 0) &&
					(tile?.y ?? 0) < (lead?.y ?? 0) + (lead?.height ?? 0) &&
					(tile?.y ?? 0) + (tile?.height ?? 0) > (lead?.y ?? 0);
				expect(overlaps, `"${caption}" overlaps the intro paragraph`).toBe(
					false,
				);
			}
		});
	}

	test("is static: no slideshow control and no horizontal scrolling", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 375, height: 812 });
		await page.goto("/");

		await expect(page.getByText(/slideshow/i)).toHaveCount(0);
		const overflow = await page.evaluate(
			() =>
				document.documentElement.scrollWidth -
				document.documentElement.clientWidth,
		);
		expect(overflow).toBeLessThanOrEqual(0);
	});
});
