import { render, screen } from "@testing-library/react";
import { notFound } from "next/navigation";
import type React from "react";
import { generateSeoMeta, generateWebPageJsonLd } from "@/lib/helper";
import { getPage, getPageSlugs } from "@/lib/pages";
import Page, { generateMetadata, generateStaticParams } from "./page";

jest.mock("next/navigation", () => ({
	notFound: jest.fn(),
}));

jest.mock("@/components/SimpleLayout/", () => ({
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

jest.mock("@/lib/helper", () => ({
	generateSeoMeta: jest.fn(),
	generateWebPageJsonLd: jest.fn(),
}));

jest.mock("@/lib/pages", () => ({
	getPage: jest.fn(),
	getPageSlugs: jest.fn(),
}));

describe("generic page route", () => {
	beforeEach(() => {
		jest.clearAllMocks();

		(getPageSlugs as jest.Mock).mockResolvedValue(["about", "gear", "uses"]);
		(getPage as jest.Mock).mockResolvedValue({
			attributes: {
				title: "Uses",
				subtitle: "Default setup",
				content: "A plain content page.",
				locale: "en",
				seo: {
					metaTitle: "Uses SEO",
					metaDescription: "Uses page description",
				},
			},
		});
		(generateSeoMeta as jest.Mock).mockReturnValue({
			title: "Uses SEO",
			description: "Uses SEO description",
		});
		(generateWebPageJsonLd as jest.Mock).mockReturnValue({
			"@context": "https://schema.org",
			"@type": "WebPage",
			name: "Uses",
		});
		(notFound as unknown as jest.Mock).mockReturnValue("NOT_FOUND");
	});

	it("filters ignored slugs from static params", async () => {
		await expect(generateStaticParams()).resolves.toEqual([
			{ slug: "about" },
			{ slug: "uses" },
		]);
		expect(getPageSlugs).toHaveBeenCalledTimes(1);
	});

	it("generates metadata for a valid page slug", async () => {
		const result = await generateMetadata({
			params: Promise.resolve({ slug: "uses" }),
		});

		expect(getPage).toHaveBeenCalledWith("uses");
		expect(generateSeoMeta).toHaveBeenCalledWith(
			"uses",
			{ metaTitle: "Uses SEO", metaDescription: "Uses page description" },
			"website",
			"en",
		);
		expect(result).toEqual({
			title: "Uses SEO",
			description: "Uses SEO description",
		});
	});

	it("returns undefined metadata for ignored slugs", async () => {
		await expect(
			generateMetadata({ params: Promise.resolve({ slug: "gear" }) }),
		).resolves.toBeUndefined();

		expect(generateSeoMeta).not.toHaveBeenCalled();
	});

	it("renders content and json-ld for a valid page", async () => {
		const ui = await Page({ params: Promise.resolve({ slug: "uses" }) });
		const { container } = render(ui);

		expect(getPage).toHaveBeenCalledWith("uses");
		expect(generateWebPageJsonLd).toHaveBeenCalledWith({
			name: "Uses",
			description: "Uses page description",
		});
		expect(screen.getByTestId("simple-layout")).toBeInTheDocument();
		expect(screen.getByText("Default setup")).toBeInTheDocument();
		expect(screen.getByText("A plain content page.")).toBeInTheDocument();

		const jsonLdScript = container.querySelector(
			'script[type="application/ld+json"]',
		);
		expect(jsonLdScript).toBeInTheDocument();
		expect(jsonLdScript?.innerHTML).toContain("schema.org");
		expect(jsonLdScript?.innerHTML).toContain("WebPage");
	});

	it("calls notFound for ignored slugs", async () => {
		await expect(
			Page({ params: Promise.resolve({ slug: "gear" }) }),
		).resolves.toBe("NOT_FOUND");

		expect(notFound).toHaveBeenCalledTimes(1);
		expect(generateWebPageJsonLd).not.toHaveBeenCalled();
	});

	it("calls notFound when the page is missing", async () => {
		(getPage as jest.Mock).mockResolvedValueOnce(undefined);

		await expect(
			Page({ params: Promise.resolve({ slug: "missing" }) }),
		).resolves.toBe("NOT_FOUND");

		expect(notFound).toHaveBeenCalledTimes(1);
	});
});
