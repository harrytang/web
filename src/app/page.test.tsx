import { render, screen } from "@testing-library/react";
import type React from "react";
import { getBlogs } from "@/lib/blogs";
import { generateProfilePageJsonLd, generateSeoMeta } from "@/lib/helper";
import { getProfile } from "@/lib/profile";
import Home, { generateMetadata } from "./page";

jest.mock("next/image", () => ({
	__esModule: true,
	default: ({
		alt,
	}: React.ComponentProps<"img"> & { unoptimized?: boolean }) => (
		<span role="img" aria-label={alt} />
	),
}));

jest.mock("next/link", () => ({
	__esModule: true,
	default: ({
		children,
		href,
		className,
	}: {
		children: React.ReactNode;
		href: string;
		className?: string;
	}) => (
		<a href={href} className={className}>
			{children}
		</a>
	),
}));

jest.mock("@/components/Container", () => ({
	Container: ({
		children,
		className,
	}: {
		children: React.ReactNode;
		className?: string;
	}) => (
		<section data-testid="container" className={className}>
			{children}
		</section>
	),
}));

jest.mock("@/components/ArticleList", () => ({
	ArticleList: ({ article }: { article: { id: number } }) => (
		<article data-testid="article-item">Article {article.id}</article>
	),
}));

jest.mock("@/components/Gallery", () => ({
	Gallery: ({ items }: { items: unknown[] }) => (
		<div data-testid="gallery">Gallery {items.length}</div>
	),
}));

jest.mock("@/components/Work/Work", () => ({
	__esModule: true,
	default: () => <aside data-testid="work">Work</aside>,
}));

jest.mock("@/lib/profile", () => ({
	getProfile: jest.fn(),
}));

jest.mock("@/lib/blogs", () => ({
	getBlogs: jest.fn(),
}));

jest.mock("@/lib/helper", () => ({
	generateSeoMeta: jest.fn(),
	generateProfilePageJsonLd: jest.fn(),
}));

describe("home page", () => {
	beforeEach(() => {
		(getProfile as jest.Mock).mockResolvedValue({
			data: {
				attributes: {
					title: "Software Builder",
					welcome: "Welcome to my website",
					seo: { metaDescription: "Profile SEO description" },
					socials: [
						{
							href: "https://github.com/example",
							icon: {
								data: {
									attributes: {
										url: "https://cdn.example/icon-github.svg",
										caption: "GitHub",
										width: 24,
										height: 24,
									},
								},
							},
						},
					],
					photos: {
						data: [{ id: 1 }, { id: 2 }],
					},
				},
			},
		});

		(getBlogs as jest.Mock).mockResolvedValue({
			data: [{ id: 101 }, { id: 102 }],
			meta: {
				pagination: { total: Number(process.env.NEXT_PUBLIC_HOME_PAGE_SIZE) },
			},
		});

		(generateSeoMeta as jest.Mock).mockReturnValue({
			title: "SEO title",
			description: "SEO description",
		});

		(generateProfilePageJsonLd as jest.Mock).mockReturnValue({
			"@context": "https://schema.org",
			"@type": "Person",
			name: process.env.NEXT_PUBLIC_SITE_NAME,
		});
	});

	it("generates metadata from seo helper + profile", async () => {
		const result = await generateMetadata();

		expect(generateSeoMeta).toHaveBeenCalledTimes(1);
		expect(result).toEqual({
			title: `${process.env.NEXT_PUBLIC_SITE_NAME} - Software Builder`,
			description: "SEO description",
		});
	});

	it("renders profile content, blogs, and json-ld script", async () => {
		const ui = await Home();
		const { container } = render(ui);

		expect(screen.getByText("Software Builder")).toBeInTheDocument();
		expect(screen.getByText("Welcome to my website")).toBeInTheDocument();
		expect(screen.getByText("Gallery 2")).toBeInTheDocument();
		expect(screen.getByTestId("work")).toBeInTheDocument();
		expect(screen.getAllByTestId("article-item")).toHaveLength(2);

		const jsonLdScript = container.querySelector(
			'script[type="application/ld+json"]',
		);
		expect(jsonLdScript).toBeInTheDocument();
		expect(jsonLdScript?.innerHTML).toContain("schema.org");
		expect(jsonLdScript?.innerHTML).toContain(
			process.env.NEXT_PUBLIC_SITE_NAME,
		);
	});
});
