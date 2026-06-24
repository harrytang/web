import { render, screen } from "@testing-library/react";
import { Footer } from "@/components/Footer";

describe("Footer", () => {
	const originalBmcUrl = process.env.NEXT_PUBLIC_BMC_URL;
	const originalStatusUrl = process.env.NEXT_PUBLIC_STATUS_URL;

	afterEach(() => {
		process.env.NEXT_PUBLIC_BMC_URL = originalBmcUrl;
		process.env.NEXT_PUBLIC_STATUS_URL = originalStatusUrl;
	});

	it("renders menu links correctly", () => {
		render(<Footer />);

		const menuLinks = [
			{ name: "Cookie Policy", path: "/cookie-policy" },
			{ name: "Disclaimer", path: "/disclaimer" },
			{ name: "Privacy Policy", path: "/privacy-policy" },
			{ name: "Terms of Use", path: "/terms-of-use" },
			{ name: "Credits", path: "/credits" },
		];

		menuLinks.forEach((menu) => {
			const linkElement = screen.getByText(menu.name);
			expect(linkElement).toBeInTheDocument();
			expect(linkElement).toHaveAttribute("href", menu.path);
		});
	});

	it("renders copyright text correctly", () => {
		render(<Footer />);
		const currentYear = new Date().getFullYear();
		const copyrightText = `© ${currentYear} ${process.env.NEXT_PUBLIC_SITE_NAME}. All rights reserved.`;
		expect(screen.getByText(copyrightText)).toBeInTheDocument();
	});

	it("renders Maxspell logo link", () => {
		const { container } = render(<Footer />);

		expect(
			screen.getByRole("link", { name: "Maxspell cloud hosting" }),
		).toHaveAttribute("href", "https://maxspell.com/cloud-hosting");
		expect(
			container.querySelector('img[src="https://maxspell.com/logo.svg"]'),
		).toBeInTheDocument();
		expect(
			container.querySelector(
				'img[src="https://maxspell.com/logo-dark.svg"]',
			),
		).toBeInTheDocument();
	});

	it("falls back to hash links for optional external links", () => {
		delete process.env.NEXT_PUBLIC_BMC_URL;
		delete process.env.NEXT_PUBLIC_STATUS_URL;

		render(<Footer />);

		expect(
			screen.getByRole("link", { name: "Buy Me a Coffee" }),
		).toHaveAttribute("href", "#");
		expect(screen.getByRole("link", { name: "Status" })).toHaveAttribute(
			"href",
			"#",
		);
	});
});
