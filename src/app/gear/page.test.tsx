import { render, screen } from "@testing-library/react";
import type React from "react";
import {
	categorizeItems,
	generateSeoMeta,
	generateWebPageJsonLd,
} from "@/lib/helper";
import { getPage } from "@/lib/pages";
import { getUses } from "@/lib/uses";
import Gear, { generateMetadata } from "./page";

jest.mock("@/components/SimpleLayout/SimpleLayout", () => ({
	__esModule: true,
	default: ({
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

jest.mock("@/components/Tool", () => ({
	Tool: ({ children, title }: { children: React.ReactNode; title: string }) => (
		<article data-testid="tool-item">
			<h3>{title}</h3>
			<div>{children}</div>
		</article>
	),
	ToolsSection: ({
		children,
		title,
	}: {
		children: React.ReactNode;
		title: string;
	}) => (
		<section data-testid="tools-section">
			<h2>{title}</h2>
			{children}
		</section>
	),
}));

jest.mock("@/lib/pages", () => ({
	getPage: jest.fn(),
}));

jest.mock("@/lib/helper", () => ({
	categorizeItems: jest.fn(),
	generateSeoMeta: jest.fn(),
	generateWebPageJsonLd: jest.fn(),
}));

jest.mock("@/lib/uses", () => ({
	getUses: jest.fn(),
}));

describe("gear page", () => {
	beforeEach(() => {
		jest.clearAllMocks();

		(getPage as jest.Mock).mockResolvedValue({
			attributes: {
				title: "Gear",
				subtitle: "Tools I use",
				content: "A categorized list of hardware and software.",
				locale: "en",
				seo: {
					metaTitle: "Gear SEO",
					metaDescription: "Gear page description",
				},
			},
		});

		(getUses as jest.Mock).mockResolvedValue({
			data: [
				{
					id: 1,
					attributes: {
						title: "MacBook Pro",
						description: "Primary machine for daily development.",
					},
				},
				{
					id: 2,
					attributes: {
						title: "VS Code",
						description: "Main editor for writing and testing code.",
					},
				},
			],
		});

		(categorizeItems as jest.Mock).mockReturnValue({
			Hardware: [
				{
					id: 1,
					attributes: {
						title: "MacBook Pro",
						description: "Primary machine for daily development.",
					},
				},
			],
			Software: [
				{
					id: 2,
					attributes: {
						title: "VS Code",
						description: "Main editor for writing and testing code.",
					},
				},
			],
		});

		(generateSeoMeta as jest.Mock).mockReturnValue({
			title: "Gear SEO",
			description: "Gear SEO description",
		});

		(generateWebPageJsonLd as jest.Mock).mockReturnValue({
			"@context": "https://schema.org",
			"@type": "WebPage",
			name: "Gear",
		});
	});

	it("generates metadata from page seo", async () => {
		const result = await generateMetadata();

		expect(getPage).toHaveBeenCalledWith("gear");
		expect(generateSeoMeta).toHaveBeenCalledWith(
			"gear",
			{ metaTitle: "Gear SEO", metaDescription: "Gear page description" },
			"website",
			"en",
		);
		expect(result).toEqual({
			title: "Gear SEO",
			description: "Gear SEO description",
		});
	});

	it("renders categorized tools and json-ld output", async () => {
		const ui = await Gear();
		const { container } = render(ui);

		expect(getPage).toHaveBeenCalledWith("gear");
		expect(getUses).toHaveBeenCalledTimes(1);
		expect(categorizeItems).toHaveBeenCalledWith([
			{
				id: 1,
				attributes: {
					title: "MacBook Pro",
					description: "Primary machine for daily development.",
				},
			},
			{
				id: 2,
				attributes: {
					title: "VS Code",
					description: "Main editor for writing and testing code.",
				},
			},
		]);
		expect(generateWebPageJsonLd).toHaveBeenCalledWith({
			name: "Gear",
			description: "Gear page description",
		});

		expect(screen.getByTestId("simple-layout")).toBeInTheDocument();
		expect(screen.getByText("Tools I use")).toBeInTheDocument();
		expect(
			screen.getByText("A categorized list of hardware and software."),
		).toBeInTheDocument();
		expect(screen.getAllByTestId("tools-section")).toHaveLength(2);
		expect(screen.getByText("Hardware")).toBeInTheDocument();
		expect(screen.getByText("Software")).toBeInTheDocument();
		expect(screen.getAllByTestId("tool-item")).toHaveLength(2);
		expect(screen.getByText("MacBook Pro")).toBeInTheDocument();
		expect(
			screen.getByText("Primary machine for daily development."),
		).toBeInTheDocument();
		expect(screen.getByText("VS Code")).toBeInTheDocument();
		expect(
			screen.getByText("Main editor for writing and testing code."),
		).toBeInTheDocument();

		const jsonLdScript = container.querySelector(
			'script[type="application/ld+json"]',
		);
		expect(jsonLdScript).toBeInTheDocument();
		expect(jsonLdScript?.innerHTML).toContain("schema.org");
		expect(jsonLdScript?.innerHTML).toContain("WebPage");
	});
});
