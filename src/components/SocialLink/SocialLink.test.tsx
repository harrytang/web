import { render, screen } from "@testing-library/react";
import React from "react";
import type { Media } from "@/types/media";
import SocialLink from "./SocialLink";

jest.mock("next/link", () => {
	return function MockLink({
		children,
		href,
		...props
	}: {
		children: React.ReactNode;
		href: string;
		[key: string]: unknown;
	}) {
		return (
			<a href={href} {...props}>
				{children}
			</a>
		);
	};
});

jest.mock("next/image", () => ({
	__esModule: true,
	default: (props: Record<string, unknown>) => {
		const { unoptimized: _unoptimized, ...imgProps } =
			props as React.ImgHTMLAttributes<HTMLImageElement> & {
				unoptimized?: boolean;
			};

		return React.createElement(
			"picture",
			null,
			React.createElement("img", imgProps),
		);
	},
}));

jest.mock("clsx", () => {
	return (...classes: (string | undefined | null | false)[]) =>
		classes.filter(Boolean).join(" ");
});

const mockIcon: Media = {
	id: 1,
	attributes: {
		name: "Twitter Icon",
		caption: "Twitter",
		url: "https://example.com/twitter-icon.svg",
		width: 24,
		height: 24,
		mime: "image/svg+xml",
		size: 100,
		previewUrl: null,
		alternativeText: "Twitter",
		formats: {},
		hash: "abc123",
		ext: ".svg",
		provider: "local",
		provider_metadata: null,
		createdAt: "2024-01-01",
		updatedAt: "2024-01-01",
	},
};

describe("SocialLink", () => {
	it("renders a link with href", () => {
		render(
			<SocialLink href="https://twitter.com" icon={mockIcon}>
				Follow on Twitter
			</SocialLink>,
		);

		const link = screen.getByRole("link", { name: /Follow on Twitter/ });
		expect(link).toHaveAttribute("href", "https://twitter.com");
	});

	it("renders icon image", () => {
		render(
			<SocialLink href="https://twitter.com" icon={mockIcon}>
				Follow on Twitter
			</SocialLink>,
		);

		const img = screen.getByAltText("Twitter");
		expect(img).toBeInTheDocument();
		expect(img).toHaveAttribute("src", "https://example.com/twitter-icon.svg");
	});

	it("renders children text", () => {
		render(
			<SocialLink href="https://twitter.com" icon={mockIcon}>
				Follow on Twitter
			</SocialLink>,
		);

		expect(screen.getByText("Follow on Twitter")).toBeInTheDocument();
	});

	it("applies custom className", () => {
		const { container } = render(
			<SocialLink
				href="https://twitter.com"
				icon={mockIcon}
				className="custom-class"
			>
				Follow
			</SocialLink>,
		);

		const li = container.querySelector("li");
		expect(li).toHaveClass("custom-class", "flex");
	});

	it("renders as list item", () => {
		const { container } = render(
			<SocialLink href="https://twitter.com" icon={mockIcon}>
				Follow
			</SocialLink>,
		);

		const li = container.querySelector("li");
		expect(li).toBeInTheDocument();
	});

	it("passes correct dimensions to image", () => {
		render(
			<SocialLink href="https://twitter.com" icon={mockIcon}>
				Follow
			</SocialLink>,
		);

		const img = screen.getByAltText("Twitter");
		expect(img).toHaveAttribute("width", "24");
		expect(img).toHaveAttribute("height", "24");
	});
});
