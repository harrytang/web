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
	await expect(page.locator("h1")).toContainText(pages[0].subtitle);

	// Check that the blogs are displayed
	for (const blog of blogs) {
		await expect(page.locator(`h2:has-text("${blog.title}")`)).toBeVisible();
	}
});

test.describe("Articles index layout", () => {
	test("opens with the latest post, then one row per post, each with a loaded cover", async ({
		page,
	}) => {
		await page.goto("/articles");

		const items = page.locator("#blogs article");
		await expect(page.getByText("Latest", { exact: true })).toHaveCount(1);
		await expect(items.first()).toContainText("Latest");
		await expect(items.nth(1)).not.toContainText("Latest");

		const count = await items.count();
		expect(count).toBeGreaterThan(1);
		for (let i = 0; i < count; i++) {
			const item = items.nth(i);
			await expect(item.getByRole("heading", { level: 2 })).toHaveCount(1);
			const cover = item.locator("img");
			await expect(cover).toHaveCount(1);
			await expect(cover).toHaveAttribute("alt", "");
			await expect
				.poll(() =>
					cover.evaluate(
						(img: HTMLImageElement) => img.complete && img.naturalWidth > 0,
					),
				)
				.toBe(true);
		}
	});

	test("lays rows out as date, text and thumbnail on a wide screen", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto("/articles");

		const row = page.locator("#blogs article").nth(1);
		const date = await row.locator("time").boundingBox();
		const title = await row.getByRole("heading").boundingBox();
		const cover = await row.locator("img").boundingBox();
		expect(date && title && cover).toBeTruthy();
		// Left to right, no overlap.
		expect((date?.x ?? 0) + (date?.width ?? 0)).toBeLessThanOrEqual(
			title?.x ?? 0,
		);
		expect((title?.x ?? 0) + (title?.width ?? 0)).toBeLessThanOrEqual(
			cover?.x ?? 0,
		);
	});

	test("puts the cover above the text on a phone without sideways scrolling", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto("/articles");

		const row = page.locator("#blogs article").nth(1);
		const cover = await row.locator("img").boundingBox();
		const title = await row.getByRole("heading").boundingBox();
		expect((cover?.y ?? 0) + (cover?.height ?? 0)).toBeLessThanOrEqual(
			title?.y ?? 0,
		);
		const overflow = await page.evaluate(
			() =>
				document.documentElement.scrollWidth -
				document.documentElement.clientWidth,
		);
		expect(overflow).toBeLessThanOrEqual(0);
	});

	test("makes the whole row a link to the post", async ({ page }) => {
		await page.goto("/articles");

		const row = page.locator("#blogs article").nth(1);
		const href = await row.getByRole("link").first().getAttribute("href");
		// The stretched link sits over the text, so click by position.
		await row.scrollIntoViewIfNeeded();
		const text = await row.locator("p").first().boundingBox();
		await page.mouse.click(
			(text?.x ?? 0) + (text?.width ?? 0) / 2,
			(text?.y ?? 0) + (text?.height ?? 0) / 2,
		);
		await expect(page).toHaveURL(new RegExp(`${href}$`));
	});

	test("outlines the row when its link is reached by keyboard", async ({
		page,
	}) => {
		await page.goto("/articles");

		// A key press first, so the browser treats the focus that follows as
		// keyboard focus (:focus-visible). Tabbing from the top would stop in the
		// search box, whose focus opens a dialog.
		await page.keyboard.press("Shift");
		await page.locator("#blogs article").nth(1).getByRole("link").focus();
		const ringOpacity = await page.evaluate(() => {
			const article = document.activeElement?.closest("#blogs article");
			const ring = article?.querySelector(
				"span[aria-hidden='true']:last-child",
			);
			return ring ? getComputedStyle(ring).opacity : "missing";
		});
		expect(ringOpacity).toBe("1");
	});

	test("lists later pages as plain rows, with no lead", async ({ page }) => {
		await page.goto("/articles/2");

		await expect(page.locator("#blogs article").first()).toBeVisible();
		await expect(page.getByText("Latest", { exact: true })).toHaveCount(0);
	});

	test("explains a page past the end and links back", async ({ page }) => {
		await page.goto("/articles/999");

		await expect(page.getByText("No articles on this page.")).toBeVisible();
		await page.getByRole("link", { name: /latest articles/i }).click();
		await expect(page).toHaveURL(/\/articles$/);
	});
});
