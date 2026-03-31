import { render, screen } from "@testing-library/react";
import React from "react";
import { generateSeoMeta, generateWebPageJsonLd } from "@/lib/helper";
import { getPage } from "@/lib/pages";
import { getProjects } from "@/lib/projects";
import Projects, { generateMetadata } from "./page";

jest.mock("next/image", () => ({
	__esModule: true,
	default: ({
		alt,
	}: React.ComponentProps<"img"> & { unoptimized?: boolean }) => (
		<span role="img" aria-label={alt} />
	),
}));

jest.mock("@heroicons/react/20/solid", () => ({
	LinkIcon: () => <span data-testid="link-icon" />,
}));

jest.mock("@/components/SimpleLayout", () => ({
	SimpleLayout: ({
		children,
		subtitle,
		content,
	}: {
		children: React.ReactNode;
		subtitle: string;
		content: string;
	}) => (
		<section data-testid="simple-layout">
			<h1>{subtitle}</h1>
			<p>{content}</p>
			{children}
		</section>
	),
}));

jest.mock("@/components/Card", () => ({
	Card: ({ children, as }: { children: React.ReactNode; as?: string }) => {
		return React.createElement(
			as === "li" ? "li" : "div",
			{ "data-testid": "project-card" },
			children,
		);
	},
	CardLink: ({
		children,
		href,
	}: {
		children: React.ReactNode;
		href: string;
	}) => <a href={href}>{children}</a>,
	CardDescription: ({ children }: { children: React.ReactNode }) => (
		<p>{children}</p>
	),
}));

jest.mock("@/lib/pages", () => ({
	getPage: jest.fn(),
}));

jest.mock("@/lib/projects", () => ({
	getProjects: jest.fn(),
}));

jest.mock("@/lib/helper", () => ({
	generateSeoMeta: jest.fn(),
	generateWebPageJsonLd: jest.fn(),
}));

describe("projects page", () => {
	beforeEach(() => {
		jest.clearAllMocks();

		(getPage as jest.Mock).mockResolvedValue({
			attributes: {
				title: "Projects",
				subtitle: "Things I have built",
				content: "Selected product and engineering work.",
				locale: "en",
				seo: {
					metaTitle: "Projects SEO",
					metaDescription: "Projects page description",
				},
			},
		});

		(getProjects as jest.Mock).mockResolvedValue({
			data: [
				{
					attributes: {
						name: "Project Atlas",
						description: "A data-heavy internal platform.",
						icon: {
							data: {
								attributes: {
									url: "https://cdn.example.com/atlas.png",
									width: 32,
									height: 32,
								},
							},
						},
						link: {
							href: "https://example.com/atlas",
							label: "example.com/atlas",
						},
					},
				},
				{
					attributes: {
						name: "Project Beacon",
						description: "An analytics and observability suite.",
						icon: {
							data: {
								attributes: {
									url: "https://cdn.example.com/beacon.png",
									width: 32,
									height: 32,
								},
							},
						},
						link: {
							href: "https://example.com/beacon",
							label: "example.com/beacon",
						},
					},
				},
			],
		});

		(generateSeoMeta as jest.Mock).mockReturnValue({
			title: "Projects SEO",
			description: "Projects SEO description",
		});

		(generateWebPageJsonLd as jest.Mock).mockReturnValue({
			"@context": "https://schema.org",
			"@type": "WebPage",
			name: "Projects",
		});
	});

	it("generates metadata from page seo", async () => {
		const result = await generateMetadata();

		expect(getPage).toHaveBeenCalledWith("projects");
		expect(generateSeoMeta).toHaveBeenCalledWith(
			"projects",
			{
				metaTitle: "Projects SEO",
				metaDescription: "Projects page description",
			},
			"website",
			"en",
		);
		expect(result).toEqual({
			title: "Projects SEO",
			description: "Projects SEO description",
		});
	});

	it("renders projects and json-ld output", async () => {
		const ui = await Projects();
		const { container } = render(ui);

		expect(getPage).toHaveBeenCalledWith("projects");
		expect(getProjects).toHaveBeenCalledTimes(1);
		expect(generateWebPageJsonLd).toHaveBeenCalledWith({
			name: "Projects",
			description: "Projects page description",
		});

		expect(screen.getByTestId("simple-layout")).toBeInTheDocument();
		expect(screen.getByText("Things I have built")).toBeInTheDocument();
		expect(
			screen.getByText("Selected product and engineering work."),
		).toBeInTheDocument();
		expect(screen.getAllByTestId("project-card")).toHaveLength(2);
		expect(screen.getByText("Project Atlas")).toBeInTheDocument();
		expect(
			screen.getByText("A data-heavy internal platform."),
		).toBeInTheDocument();
		expect(screen.getByText("Project Beacon")).toBeInTheDocument();
		expect(
			screen.getByText("An analytics and observability suite."),
		).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Project Atlas" })).toHaveAttribute(
			"href",
			"https://example.com/atlas",
		);
		expect(
			screen.getByRole("link", { name: "Project Beacon" }),
		).toHaveAttribute("href", "https://example.com/beacon");
		expect(
			screen.getByRole("img", { name: "Project Atlas" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("img", { name: "Project Beacon" }),
		).toBeInTheDocument();
		expect(screen.getAllByTestId("link-icon")).toHaveLength(2);
		expect(screen.getByText("example.com/atlas")).toBeInTheDocument();
		expect(screen.getByText("example.com/beacon")).toBeInTheDocument();

		const jsonLdScript = container.querySelector(
			'script[type="application/ld+json"]',
		);
		expect(jsonLdScript).toBeInTheDocument();
		expect(jsonLdScript?.innerHTML).toContain("schema.org");
		expect(jsonLdScript?.innerHTML).toContain("WebPage");
	});
});
