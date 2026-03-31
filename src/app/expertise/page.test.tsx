import { render, screen } from "@testing-library/react";
import type React from "react";
import { generateSeoMeta, generateWebPageJsonLd } from "@/lib/helper";
import { getPage } from "@/lib/pages";
import { listRandomSkill } from "@/lib/skills";
import Expertise, { generateMetadata, revalidate } from "./page";

jest.mock("next/image", () => ({
	__esModule: true,
	default: ({
		alt,
	}: React.ComponentProps<"img"> & { unoptimized?: boolean }) => (
		<span role="img" aria-label={alt} />
	),
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

jest.mock("@/lib/pages", () => ({
	getPage: jest.fn(),
}));

jest.mock("@/lib/helper", () => ({
	generateSeoMeta: jest.fn(),
	generateWebPageJsonLd: jest.fn(),
}));

jest.mock("@/lib/skills", () => ({
	listRandomSkill: jest.fn(),
}));

describe("expertise page", () => {
	beforeEach(() => {
		jest.clearAllMocks();

		(getPage as jest.Mock).mockResolvedValue({
			attributes: {
				title: "Expertise",
				subtitle: "Skills and strengths",
				content: "A curated list of professional skills.",
				locale: "en",
				seo: {
					metaTitle: "Expertise SEO",
					metaDescription: "Expertise page description",
				},
			},
		});

		(listRandomSkill as jest.Mock).mockResolvedValue([
			{
				attributes: {
					name: "TypeScript",
					content: "Building reliable frontends and APIs.",
					image: {
						data: {
							attributes: {
								url: "https://cdn.example.com/typescript.svg",
								width: 96,
								height: 96,
							},
						},
					},
				},
			},
			{
				attributes: {
					name: "React",
					content: "Designing component systems and product UI.",
					image: {
						data: {
							attributes: {
								url: "https://cdn.example.com/react.svg",
								width: 96,
								height: 96,
							},
						},
					},
				},
			},
		]);

		(generateSeoMeta as jest.Mock).mockReturnValue({
			title: "Expertise SEO",
			description: "Expertise SEO description",
		});

		(generateWebPageJsonLd as jest.Mock).mockReturnValue({
			"@context": "https://schema.org",
			"@type": "WebPage",
			name: "Expertise",
		});
	});

	it("exports expected revalidate value", () => {
		expect(revalidate).toBe(3600);
	});

	it("generates metadata from page seo", async () => {
		const result = await generateMetadata();

		expect(getPage).toHaveBeenCalledWith("expertise");
		expect(generateSeoMeta).toHaveBeenCalledWith(
			"expertise",
			{
				metaTitle: "Expertise SEO",
				metaDescription: "Expertise page description",
			},
			"website",
			"en",
		);
		expect(result).toEqual({
			title: "Expertise SEO",
			description: "Expertise SEO description",
		});
	});

	it("renders skills and json-ld output", async () => {
		const ui = await Expertise();
		const { container } = render(ui);

		expect(getPage).toHaveBeenCalledWith("expertise");
		expect(listRandomSkill).toHaveBeenCalledTimes(1);
		expect(generateWebPageJsonLd).toHaveBeenCalledWith({
			name: "Expertise",
			description: "Expertise page description",
		});

		expect(screen.getByTestId("simple-layout")).toBeInTheDocument();
		expect(screen.getByText("Skills and strengths")).toBeInTheDocument();
		expect(
			screen.getByText("A curated list of professional skills."),
		).toBeInTheDocument();
		expect(screen.getByText("TypeScript")).toBeInTheDocument();
		expect(
			screen.getByText("Building reliable frontends and APIs."),
		).toBeInTheDocument();
		expect(screen.getByText("React")).toBeInTheDocument();
		expect(
			screen.getByText("Designing component systems and product UI."),
		).toBeInTheDocument();
		expect(screen.getByRole("img", { name: "TypeScript" })).toBeInTheDocument();
		expect(screen.getByRole("img", { name: "React" })).toBeInTheDocument();

		const jsonLdScript = container.querySelector(
			'script[type="application/ld+json"]',
		);
		expect(jsonLdScript).toBeInTheDocument();
		expect(jsonLdScript?.innerHTML).toContain("schema.org");
		expect(jsonLdScript?.innerHTML).toContain("WebPage");
	});
});
