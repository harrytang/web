import { render, screen } from "@testing-library/react";
import type { Blog } from "@/lib/blogs";
import ArticleList from "./ArticleList";

const mockArticle: Blog = {
	documentId: "blog-1",
	slug: "test-article",
	title: "Test Article",
	publishedAt: "2023-06-01T00:00:00.000Z",
	seo: {
		metaDescription: "This is a test article for testing purposes.",
		id: 0,
		metaTitle: "",
		keywords: "",
		metaRobots: null,
		structuredData: null,
		metaViewport: null,
		canonicalURL: null,
		metaImage: {
			id: 0,
			documentId: "media-0",
			name: "",
			alternativeText: "",
			caption: "",
			width: 0,
			height: 0,
			formats: {
				large: undefined,
				medium: undefined,
				small: undefined,
				thumbnail: undefined,
			},
			hash: "",
			ext: "",
			mime: "",
			size: 0,
			url: "",
			previewUrl: null,
			provider: "",
			provider_metadata: null,
			createdAt: "",
			updatedAt: "",
		},
		metaSocial: [],
	},
	content: "",
	locale: "",
	createdAt: "",
	updatedAt: "",
	id: 0,
};

jest.mock("next/image", () => ({
	__esModule: true,
	default: (props: { src: string; alt: string }) => (
		<div data-testid="cover" data-src={props.src} data-alt={props.alt} />
	),
}));

const withCover = (url: string): Blog => ({
	...mockArticle,
	seo: {
		...mockArticle.seo,
		metaImage: {
			...mockArticle.seo.metaImage,
			url,
			width: 1200,
			height: 630,
		},
	},
});

describe("ArticleList", () => {
	it("never shows a cover on the home page card", () => {
		render(
			<ArticleList
				article={withCover("https://cdn.test/cover.jpg")}
				type="card"
			/>,
		);

		expect(screen.queryByTestId("cover")).toBeNull();
	});

	describe.each(["row", "lead"] as const)("the %s type", (type) => {
		const cover = "https://cdn.test/cover.jpg";

		it("is one link to the post, named by the title", () => {
			render(<ArticleList article={withCover(cover)} type={type} />);

			const links = screen.getAllByRole("link");
			expect(links).toHaveLength(1);
			expect(links[0]).toHaveAttribute("href", "/blog/test-article");
			expect(links[0]).toHaveAccessibleName("Test Article");
		});

		it("shows the date, summary and call to action", () => {
			render(<ArticleList article={withCover(cover)} type={type} />);

			expect(screen.getByRole("article")).toBeInTheDocument();
			expect(screen.getByText(/1 June 2023/)).toHaveAttribute(
				"datetime",
				"2023-06-01T00:00:00.000Z",
			);
			expect(
				screen.getByText("This is a test article for testing purposes."),
			).toBeInTheDocument();
			expect(screen.getByText("Read article")).toBeInTheDocument();
		});

		it("uses the title as an h2 on the listing page", () => {
			render(
				<ArticleList article={withCover(cover)} type={type} heading="h2" />,
			);

			expect(
				screen.getByRole("heading", { level: 2, name: "Test Article" }),
			).toBeInTheDocument();
		});

		it("shows the cover as a decorative picture, since the title names the post", () => {
			render(<ArticleList article={withCover(cover)} type={type} />);

			const picture = screen.getByTestId("cover");
			expect(picture).toHaveAttribute("data-src", cover);
			expect(picture).toHaveAttribute("data-alt", "");
			expect(screen.getByRole("article")).toContainElement(picture);
		});

		it("still reads well when the post has no cover", () => {
			render(<ArticleList article={mockArticle} type={type} />);

			expect(screen.queryByTestId("cover")).toBeNull();
			expect(screen.getByRole("link", { name: "Test Article" })).toBeVisible();
		});
	});

	it("marks the lead as the latest post", () => {
		render(<ArticleList article={mockArticle} type="lead" />);

		expect(screen.getByText("Latest")).toBeInTheDocument();
	});

	it("does not label a row as the latest post", () => {
		render(<ArticleList article={mockArticle} type="row" />);

		expect(screen.queryByText("Latest")).toBeNull();
	});

	it("has correct link in the title", () => {
		render(<ArticleList article={mockArticle} type="card" />);
		const titleLink = screen.getByRole("link", { name: "Test Article" });
		expect(titleLink).toHaveAttribute("href", "/blog/test-article");
	});

	it.each(["featured", "card"] as const)(
		"renders the %s type with a dated heading, summary and call to action",
		(type) => {
			render(<ArticleList article={mockArticle} type={type} />);

			expect(screen.getByRole("article")).toBeInTheDocument();
			// Titles sit under the page's "Articles" h2, so they are h3.
			expect(
				screen.getByRole("heading", { level: 3, name: "Test Article" }),
			).toBeInTheDocument();
			expect(
				screen.getByText("This is a test article for testing purposes."),
			).toBeInTheDocument();
			expect(screen.getByText("Read article")).toBeInTheDocument();
			expect(screen.getByText(/1 June 2023/)).toHaveAttribute(
				"datetime",
				"2023-06-01T00:00:00.000Z",
			);
		},
	);

	it.each(["featured", "card"] as const)(
		"makes the whole %s card one link to the post",
		(type) => {
			render(<ArticleList article={mockArticle} type={type} />);

			const links = screen.getAllByRole("link");
			expect(links).toHaveLength(1);
			expect(links[0]).toHaveAttribute("href", "/blog/test-article");
			expect(links[0]).toHaveAccessibleName("Test Article");
		},
	);

	it.each(["featured", "card"] as const)(
		"lets the %s title be an h2 when the page has no section heading above it",
		(type) => {
			render(<ArticleList article={mockArticle} type={type} heading="h2" />);

			expect(
				screen.getByRole("heading", { level: 2, name: "Test Article" }),
			).toBeInTheDocument();
			expect(screen.queryByRole("heading", { level: 3 })).toBeNull();
		},
	);

	it("gives the featured type more presence than a card", () => {
		const { rerender } = render(
			<ArticleList article={mockArticle} type="featured" />,
		);
		const featuredHeading = screen.getByRole("heading", { level: 3 });
		expect(featuredHeading).toHaveClass("text-3xl/9");

		rerender(<ArticleList article={mockArticle} type="card" />);
		expect(screen.getByRole("heading", { level: 3 })).toHaveClass("text-xl/7");
	});
});
