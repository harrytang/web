import { render, screen } from "@testing-library/react";
import type React from "react";
import { getBlogs } from "@/lib/blogs";
import {
	generateListArticleJsonLd,
	generateSeoMeta,
	generateWebPageJsonLd,
} from "@/lib/helper";
import { getPage } from "@/lib/pages";
import ArticlesIndex, { generateMetadata, generateStaticParams } from "./page";

jest.mock("@/components/SimpleLayout", () => ({
	SimpleLayout: ({
		children,
		subtitle,
		content,
		seachBox,
	}: {
		children: React.ReactNode;
		subtitle: string;
		content: string;
		seachBox: boolean;
	}) => (
		<section data-testid="simple-layout" data-search-box={String(seachBox)}>
			<h1>{subtitle}</h1>
			<p>{content}</p>
			{children}
		</section>
	),
}));

jest.mock("@/components/ArticleList", () => ({
	ArticleList: ({
		article,
		type,
	}: {
		article: { id: number; attributes: { title: string } };
		type: string;
	}) => (
		<article data-testid="article-item" data-type={type}>
			{article.attributes.title}
		</article>
	),
}));

jest.mock("@/components/Pagination", () => ({
	Pagination: ({
		totalPages,
		currentPage,
	}: {
		totalPages: number;
		currentPage: number;
	}) => (
		<nav data-testid="pagination">
			Page {currentPage} of {totalPages}
		</nav>
	),
}));

jest.mock("@/lib/blogs", () => ({
	getBlogs: jest.fn(),
}));

jest.mock("@/lib/pages", () => ({
	getPage: jest.fn(),
}));

jest.mock("@/lib/helper", () => ({
	generateListArticleJsonLd: jest.fn(),
	generateSeoMeta: jest.fn(),
	generateWebPageJsonLd: jest.fn(),
}));

describe("articles paginated page", () => {
	beforeEach(() => {
		jest.clearAllMocks();

		(getPage as jest.Mock).mockResolvedValue({
			attributes: {
				title: "Articles",
				subtitle: "Latest writing",
				content: "Browse all posts",
				locale: "en",
				seo: {
					metaTitle: "Articles",
					metaDescription: "All article pages",
				},
			},
		});

		(getBlogs as jest.Mock).mockResolvedValue({
			data: [
				{ id: 101, attributes: { title: "Post 101" } },
				{ id: 102, attributes: { title: "Post 102" } },
			],
			meta: {
				pagination: { total: 25 },
			},
		});

		(generateSeoMeta as jest.Mock).mockReturnValue({
			title: "Articles SEO",
			description: "Articles SEO description",
		});

		(generateWebPageJsonLd as jest.Mock).mockReturnValue({
			"@context": "https://schema.org",
			"@type": "WebPage",
			name: "Articles",
		});

		(generateListArticleJsonLd as jest.Mock).mockReturnValue({
			"@context": "https://schema.org",
			"@type": "ItemList",
			numberOfItems: 2,
		});
	});

	it("generates metadata for the first articles page", async () => {
		const result = await generateMetadata({
			params: Promise.resolve({ current: "1" }),
		});

		expect(getPage).toHaveBeenCalledWith("articles");
		expect(generateSeoMeta).toHaveBeenCalledWith(
			"articles",
			expect.objectContaining({
				metaTitle: "Articles - Page 1",
				metaDescription: "All article pages (Page 1)",
			}),
			"website",
			"en",
		);
		expect(result).toEqual({
			title: "Articles SEO",
			description: "Articles SEO description",
		});
	});

	it("generates metadata for a later articles page", async () => {
		await generateMetadata({
			params: Promise.resolve({ current: "3" }),
		});

		expect(generateSeoMeta).toHaveBeenCalledWith(
			"articles/3",
			expect.objectContaining({
				metaTitle: "Articles - Page 3",
				metaDescription: "All article pages (Page 3)",
			}),
			"website",
			"en",
		);
	});

	it("generates static params from total blog count", async () => {
		(getBlogs as jest.Mock).mockResolvedValueOnce({
			data: [],
			meta: { pagination: { total: 25 } },
		});

		const params = await generateStaticParams();
		const pageSize = parseInt(process.env.NEXT_PUBLIC_PAGE_SIZE || "10", 10);
		const totalPages = Math.ceil(25 / pageSize);

		expect(getBlogs).toHaveBeenCalledWith(0, 1);
		expect(params).toEqual(
			Array.from({ length: totalPages }, (_, index) => ({
				current: String(index + 1),
			})),
		);
	});

	it("renders articles list, pagination, and json-ld for a later page", async () => {
		const pageSize = parseInt(process.env.NEXT_PUBLIC_PAGE_SIZE || "10", 10);
		const ui = await ArticlesIndex({
			params: Promise.resolve({ current: "2" }),
		});
		const { container } = render(ui);

		expect(getPage).toHaveBeenCalledWith("articles");
		expect(getBlogs).toHaveBeenCalledWith(pageSize, pageSize);
		expect(generateWebPageJsonLd).toHaveBeenCalledWith({
			name: "Articles",
			description: "All article pages",
		});
		expect(generateListArticleJsonLd).toHaveBeenCalledWith([
			{ id: 101, attributes: { title: "Post 101" } },
			{ id: 102, attributes: { title: "Post 102" } },
		]);

		expect(screen.getByTestId("simple-layout")).toHaveAttribute(
			"data-search-box",
			"true",
		);
		expect(screen.getByText("Latest writing")).toBeInTheDocument();
		expect(screen.getByText("Browse all posts")).toBeInTheDocument();
		expect(screen.getAllByTestId("article-item")).toHaveLength(2);
		expect(screen.getByTestId("pagination")).toHaveTextContent(
			`Page 2 of ${Math.ceil(25 / pageSize)}`,
		);

		const scripts = container.querySelectorAll(
			'script[type="application/ld+json"]',
		);
		expect(scripts).toHaveLength(2);
		expect(scripts[0]?.innerHTML).toContain("WebPage");
		expect(scripts[1]?.innerHTML).toContain("ItemList");
	});

	it("falls back to the first page when current is empty", async () => {
		const pageSize = parseInt(process.env.NEXT_PUBLIC_PAGE_SIZE || "10", 10);
		const ui = await ArticlesIndex({
			params: Promise.resolve({ current: "" }),
		});

		render(ui);

		expect(getBlogs).toHaveBeenCalledWith(0, pageSize);
		expect(screen.getByTestId("pagination")).toHaveTextContent("Page 1 of");
	});
});
