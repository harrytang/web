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

	it("credits Maxspell hosting with a plain text link", () => {
		render(<Footer />);

		const link = screen.getByRole("link", { name: "Maxspell" });
		expect(link).toHaveAttribute("href", "https://maxspell.com/cloud-hosting");
		expect(link).toHaveAttribute("target", "_blank");
		expect(link).toHaveAttribute("rel", "noopener noreferrer");
	});

	it("places the hosting credit next to the copyright notice", () => {
		render(<Footer />);

		const notice = screen.getByRole("link", { name: "Maxspell" }).closest("p");
		expect(notice).toHaveTextContent(
			/All rights reserved\.\s*Hosted by\s*Maxspell/,
		);
	});

	it("does not use a logo image for the hosting credit", () => {
		const { container } = render(<Footer />);

		expect(container.querySelector("img")).toBeNull();
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
