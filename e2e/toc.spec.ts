import { expect, type Page, test } from "@playwright/test";
import { extractHeadings } from "@/lib/toc";
import { getLatestBlogs, newStrapiContext } from "./strapi";

// A recent post that is long enough to have a table of contents.
const postWithHeadings = async () => {
	const reqCtx = await newStrapiContext();
	const blogs = await getLatestBlogs(reqCtx, 15);
	await reqCtx.dispose();

	const blog = blogs.find((b) => extractHeadings(b.content).length >= 2);
	// Content-dependent: with no qualifying recent post there is nothing to test.
	test.skip(!blog, "no recent post has two or more headings");
	if (!blog) {
		throw new Error("unreachable: test.skip ends the test");
	}
	return { slug: blog.slug, headings: extractHeadings(blog.content) };
};

const visibleToc = (page: Page) =>
	page.locator('nav[aria-label="Table of contents"]:visible');

test.describe("Blog table of contents", () => {
	test("lists every heading in a left column on desktop", async ({ page }) => {
		const { slug, headings } = await postWithHeadings();
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto(`/blog/${slug}`);

		const toc = visibleToc(page);
		await expect(toc).toBeVisible();
		await expect(toc.locator("p")).toHaveText("Table of contents");
		await expect(toc.locator("a")).toHaveText(headings.map((h) => h.text));

		const tocBox = await toc.boundingBox();
		const articleBox = await page.locator("article[lang]").boundingBox();
		expect(tocBox).not.toBeNull();
		expect(articleBox).not.toBeNull();
		// Left of the article, not above it.
		expect((tocBox?.x ?? 0) + (tocBox?.width ?? 0)).toBeLessThanOrEqual(
			articleBox?.x ?? 0,
		);
	});

	test("every link points at exactly one heading on the page", async ({
		page,
	}) => {
		const { slug, headings } = await postWithHeadings();
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto(`/blog/${slug}`);

		const ids = headings.map((h) => h.id);
		expect(new Set(ids).size).toBe(ids.length);
		for (const heading of headings) {
			await expect(
				visibleToc(page).locator(`a[href="#${heading.id}"]`),
			).toHaveCount(1);
			await expect(page.locator(`article [id="${heading.id}"]`)).toHaveCount(1);
		}
	});

	test("clicking a link scrolls its heading into view and highlights it", async ({
		page,
	}) => {
		const { slug, headings } = await postWithHeadings();
		const target = headings[headings.length - 1];
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto(`/blog/${slug}`);

		await visibleToc(page).locator(`a[href="#${target.id}"]`).click();

		await expect(page).toHaveURL(new RegExp(`#${target.id}$`));
		const heading = page.locator(`article [id="${target.id}"]`);
		await expect(heading).toBeInViewport();
		// Clear of the sticky header (about 64px tall).
		await expect
			.poll(async () => (await heading.boundingBox())?.y ?? 0)
			.toBeGreaterThan(60);
		await expect(
			visibleToc(page).locator('a[aria-current="location"]'),
		).toHaveText(target.text);
	});

	test("stays in view while the article is read", async ({ page }) => {
		const { slug } = await postWithHeadings();
		await page.setViewportSize({ width: 1440, height: 900 });
		await page.goto(`/blog/${slug}`);

		await page.mouse.wheel(0, 1200);
		await page.waitForTimeout(300);

		const box = await visibleToc(page).boundingBox();
		expect(box).not.toBeNull();
		expect(box?.y ?? -1).toBeGreaterThanOrEqual(0);
		expect(box?.y ?? 999).toBeLessThan(200);
	});

	test("folds into a disclosure on a phone", async ({ page }) => {
		const { slug, headings } = await postWithHeadings();
		await page.setViewportSize({ width: 375, height: 812 });
		await page.goto(`/blog/${slug}`);

		const summary = page.locator("summary", { hasText: "Table of contents" });
		await expect(summary).toBeVisible();
		await expect(
			page.locator('nav[aria-label="Table of contents"] > p'),
		).toBeHidden();

		await summary.click();
		const last = headings[headings.length - 1];
		const link = visibleToc(page).locator(`a[href="#${last.id}"]`);
		await expect(link).toBeVisible();

		await link.click();
		await expect(page.locator(`article [id="${last.id}"]`)).toBeInViewport();
		// The disclosure folds away after a choice.
		await expect(link).toBeHidden();

		const overflow = await page.evaluate(
			() =>
				document.documentElement.scrollWidth -
				document.documentElement.clientWidth,
		);
		expect(overflow).toBeLessThanOrEqual(0);
	});
});
