import { render, screen } from "@testing-library/react";
import { notFound } from "next/navigation";
import { getBlog, getBlogSlugs } from "@/lib/blogs";
import { generateArticleJsonLd, generateSeoMeta } from "@/lib/helper";
import Blog, { generateMetadata, generateStaticParams } from "./page";

jest.mock("next/navigation", () => ({
	notFound: jest.fn(),
}));

jest.mock("@/components/BlogLayout", () => ({
	BlogLayout: ({ blog }: { blog: { attributes: { title: string } } }) => (
		<article data-testid="blog-layout">{blog.attributes.title}</article>
	),
}));

jest.mock("@/lib/blogs", () => ({
	getBlog: jest.fn(),
	getBlogSlugs: jest.fn(),
}));

jest.mock("@/lib/helper", () => ({
	generateArticleJsonLd: jest.fn(),
	generateSeoMeta: jest.fn(),
}));

describe("blog page", () => {
	beforeEach(() => {
		jest.clearAllMocks();

		(getBlogSlugs as jest.Mock).mockResolvedValue([
			"first-post",
			"second-post",
		]);
		(getBlog as jest.Mock).mockResolvedValue({
			id: 10,
			attributes: {
				title: "First Post",
				locale: "en",
				seo: {
					metaTitle: "First Post SEO",
					metaDescription: "A detailed article",
				},
			},
		});
		(generateSeoMeta as jest.Mock).mockReturnValue({
			title: "Blog SEO",
			description: "Blog SEO description",
		});
		(generateArticleJsonLd as jest.Mock).mockReturnValue({
			"@context": "https://schema.org",
			"@type": "Article",
			headline: "First Post",
		});
		(notFound as unknown as jest.Mock).mockReturnValue("NOT_FOUND");
	});

	it("generates static params from available slugs", async () => {
		await expect(generateStaticParams()).resolves.toEqual([
			{ slug: "first-post" },
			{ slug: "second-post" },
		]);
		expect(getBlogSlugs).toHaveBeenCalledTimes(1);
	});

	it("generates metadata when a blog exists", async () => {
		const result = await generateMetadata({
			params: Promise.resolve({ slug: "first-post" }),
		});

		expect(getBlog).toHaveBeenCalledWith("first-post");
		expect(generateSeoMeta).toHaveBeenCalledWith(
			"blog/first-post",
			{ metaTitle: "First Post SEO", metaDescription: "A detailed article" },
			"article",
			"en",
		);
		expect(result).toEqual({
			title: "Blog SEO",
			description: "Blog SEO description",
		});
	});

	it("returns undefined metadata when the blog does not exist", async () => {
		(getBlog as jest.Mock).mockResolvedValueOnce(undefined);

		await expect(
			generateMetadata({
				params: Promise.resolve({ slug: "missing-post" }),
			}),
		).resolves.toBeUndefined();

		expect(generateSeoMeta).not.toHaveBeenCalled();
	});

	it("renders the blog layout and json-ld script", async () => {
		const ui = await Blog({
			params: Promise.resolve({ slug: "first-post" }),
		});
		const { container } = render(ui);

		expect(getBlog).toHaveBeenCalledWith("first-post");
		expect(screen.getByTestId("blog-layout")).toHaveTextContent("First Post");
		expect(generateArticleJsonLd).toHaveBeenCalledWith(
			expect.objectContaining({
				attributes: expect.objectContaining({ title: "First Post" }),
			}),
		);

		const jsonLdScript = container.querySelector(
			'script[type="application/ld+json"]',
		);
		expect(jsonLdScript).toBeInTheDocument();
		expect(jsonLdScript?.innerHTML).toContain("schema.org");
		expect(jsonLdScript?.innerHTML).toContain("Article");
	});

	it("calls notFound when the blog is missing", async () => {
		(getBlog as jest.Mock).mockResolvedValueOnce(undefined);

		await expect(
			Blog({ params: Promise.resolve({ slug: "missing-post" }) }),
		).resolves.toBe("NOT_FOUND");

		expect(notFound).toHaveBeenCalledTimes(1);
		expect(generateArticleJsonLd).not.toHaveBeenCalled();
	});
});
