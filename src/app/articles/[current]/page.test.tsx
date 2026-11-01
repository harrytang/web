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
		heading,
	}: {
		article: { id: number; title: string };
		type: string;
		heading?: string;
	}) => (
		<article data-testid="article-item" data-type={type} data-heading={heading}>
			{article.title}
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
	const originalPageSize = process.env.NEXT_PUBLIC_PAGE_SIZE;

	beforeEach(() => {
		jest.clearAllMocks();

		(getPage as jest.Mock).mockResolvedValue({
			title: "Articles",
			subtitle: "Latest writing",
			content: "Browse all posts",
			locale: "en",
			seo: {
				metaTitle: "Articles",
				metaDescription: "All article pages",
			},
		});

		(getBlogs as jest.Mock).mockResolvedValue({
			data: [
				{ id: 101, title: "Post 101" },
				{ id: 102, title: "Post 102" },
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

	afterEach(() => {
		process.env.NEXT_PUBLIC_PAGE_SIZE = originalPageSize;
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
			{ id: 101, title: "Post 101" },
			{ id: 102, title: "Post 102" },
		]);

		expect(screen.getByTestId("simple-layout")).toHaveAttribute(
			"data-search-box",
			"true",
		);
		expect(screen.getByText("Latest writing")).toBeInTheDocument();
		expect(screen.getByText("Browse all posts")).toBeInTheDocument();
		expect(screen.getAllByTestId("article-item")).toHaveLength(2);
		// Later pages are a plain index: no lead, every post is a row under an h2.
		for (const item of screen.getAllByTestId("article-item")) {
			expect(item).toHaveAttribute("data-type", "row");
			expect(item).toHaveAttribute("data-heading", "h2");
		}
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

	it("leads the first page with the latest post and lists the rest as rows", async () => {
		const ui = await ArticlesIndex({
			params: Promise.resolve({ current: "1" }),
		});
		render(ui);

		const items = screen.getAllByTestId("article-item");
		expect(items.map((item) => item.getAttribute("data-type"))).toEqual([
			"lead",
			"row",
		]);
		expect(items[0]).toHaveTextContent("Post 101");
	});

	it("shows a single post as the lead with no rows", async () => {
		(getBlogs as jest.Mock).mockResolvedValue({
			data: [{ id: 1, title: "Only post" }],
			meta: { pagination: { total: 1 } },
		});
		const ui = await ArticlesIndex({
			params: Promise.resolve({ current: "1" }),
		});
		render(ui);

		expect(
			screen
				.getAllByTestId("article-item")
				.map((item) => item.getAttribute("data-type")),
		).toEqual(["lead"]);
	});

	it("explains an empty page and links back to the latest articles", async () => {
		(getBlogs as jest.Mock).mockResolvedValue({
			data: [],
			meta: { pagination: { total: 25 } },
		});
		const ui = await ArticlesIndex({
			params: Promise.resolve({ current: "99" }),
		});
		render(ui);

		expect(screen.queryAllByTestId("article-item")).toHaveLength(0);
		// The link back is the only way on; pagination for a missing page is noise.
		expect(screen.queryByTestId("pagination")).toBeNull();
		expect(screen.getByText("No articles on this page.")).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: /latest articles/i }),
		).toHaveAttribute("href", "/articles");
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

	it("uses default page size when NEXT_PUBLIC_PAGE_SIZE is missing", async () => {
		delete process.env.NEXT_PUBLIC_PAGE_SIZE;
		(getBlogs as jest.Mock).mockResolvedValueOnce({
			data: [],
			meta: { pagination: { total: 21 } },
		});

		const params = await generateStaticParams();
		expect(params).toEqual([
			{ current: "1" },
			{ current: "2" },
			{ current: "3" },
		]);

		(getBlogs as jest.Mock).mockResolvedValue({
			data: [{ id: 1, title: "Post 1" }],
			meta: { pagination: { total: 21 } },
		});
		const ui = await ArticlesIndex({
			params: Promise.resolve({ current: "2" }),
		});
		render(ui);

		expect(getBlogs).toHaveBeenCalledWith(10, 10);
	});
});
