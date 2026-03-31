import { render, screen } from "@testing-library/react";
import type React from "react";
import { generateProfilePageJsonLd, generateSeoMeta } from "@/lib/helper";
import { getProfile } from "@/lib/profile";
import About, { generateMetadata } from "./page";

jest.mock("next/image", () => ({
	__esModule: true,
	default: ({
		alt,
	}: React.ComponentProps<"img"> & { unoptimized?: boolean }) => (
		<span role="img" aria-label={alt} />
	),
}));

jest.mock("react-markdown", () => ({
	__esModule: true,
	default: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
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

jest.mock("@/components/SocialLink", () => ({
	SocialLink: ({
		children,
		href,
		className,
	}: {
		children: React.ReactNode;
		href: string;
		className?: string;
	}) => (
		<a href={href} className={className} data-testid="social-link">
			{children}
		</a>
	),
}));

jest.mock("@/lib/profile", () => ({
	getProfile: jest.fn(),
}));

jest.mock("@/lib/helper", () => ({
	generateSeoMeta: jest.fn(),
	generateProfilePageJsonLd: jest.fn(),
}));

describe("about page", () => {
	beforeEach(() => {
		(getProfile as jest.Mock).mockResolvedValue({
			data: {
				attributes: {
					about: "About Harry",
					biography: "Hello from biography",
					seo: { metaDescription: "About page description" },
					portraitPhoto: {
						data: {
							attributes: {
								url: "https://cdn.example.com/photo.jpg",
								caption: "Portrait",
								width: 320,
								height: 320,
							},
						},
					},
					socials: [
						{
							title: "GitHub",
							href: "https://github.com/example",
							icon: { data: { id: 1 } },
						},
						{
							title: "LinkedIn",
							href: "https://linkedin.com/in/example",
							icon: { data: { id: 2 } },
						},
					],
				},
			},
		});

		(generateSeoMeta as jest.Mock).mockReturnValue({
			title: "About SEO",
			description: "About SEO description",
		});

		(generateProfilePageJsonLd as jest.Mock).mockReturnValue({
			"@context": "https://schema.org",
			"@type": "ProfilePage",
			name: "About Harry",
		});
	});

	it("generates metadata from profile seo", async () => {
		const result = await generateMetadata();

		expect(getProfile).toHaveBeenCalledTimes(1);
		expect(generateSeoMeta).toHaveBeenCalledWith(
			"about",
			{ metaDescription: "About page description" },
			"profile",
			"en",
		);
		expect(result).toEqual({
			title: "About SEO",
			description: "About SEO description",
		});
	});

	it("renders about content, social links, and json-ld script", async () => {
		const ui = await About({});
		const { container } = render(ui);

		expect(screen.getByTestId("container")).toBeInTheDocument();
		expect(screen.getByText("About Harry")).toBeInTheDocument();
		expect(screen.getByText("Hello from biography")).toBeInTheDocument();
		expect(screen.getByRole("img", { name: "Portrait" })).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute(
			"href",
			"https://github.com/example",
		);
		expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
			"href",
			"https://linkedin.com/in/example",
		);
		expect(screen.getAllByTestId("social-link")).toHaveLength(2);

		const jsonLdScript = container.querySelector(
			'script[type="application/ld+json"]',
		);
		expect(jsonLdScript).toBeInTheDocument();
		expect(jsonLdScript?.innerHTML).toContain("schema.org");
		expect(jsonLdScript?.innerHTML).toContain("ProfilePage");
	});
});
