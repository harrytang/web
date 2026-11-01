import { render } from "@testing-library/react";
import Avatar from "./Avatar";

describe("Avatar", () => {
	const originalAvatarUrl = process.env.NEXT_PUBLIC_AVATAR_URL;
	const originalSiteName = process.env.NEXT_PUBLIC_SITE_NAME;

	afterEach(() => {
		process.env.NEXT_PUBLIC_AVATAR_URL = originalAvatarUrl;
		process.env.NEXT_PUBLIC_SITE_NAME = originalSiteName;
	});

	it("renders correctly with default props", () => {
		const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Site";
		const { getByAltText } = render(<Avatar />);
		const imageElement = getByAltText(siteName);
		expect(imageElement).toHaveAttribute("width", "512");
		expect(imageElement).toHaveAttribute("height", "512");
		expect(imageElement).toHaveClass("size-10", "rounded-full");
	});

	it("links home with an accessible label", () => {
		const { container } = render(<Avatar />);

		const linkElement = container.querySelector("a");
		expect(linkElement).toHaveAttribute("href", "/");
		expect(linkElement).toHaveAttribute("aria-label", "Home");
	});

	it("renders with additional className", () => {
		const { container } = render(<Avatar className="extra-class" />);

		const linkElement = container.querySelector("a");
		expect(linkElement).toHaveClass("extra-class");
	});

	it("passes additional props to the Link component", () => {
		const { container } = render(<Avatar data-testid="avatar-link" />);

		const linkElement = container.querySelector("a");
		expect(linkElement).toHaveAttribute("data-testid", "avatar-link");
	});

	it("falls back to default site name and empty avatar url when env vars are missing", () => {
		delete process.env.NEXT_PUBLIC_AVATAR_URL;
		delete process.env.NEXT_PUBLIC_SITE_NAME;

		const { getByAltText } = render(<Avatar />);
		const imageElement = getByAltText("Site");
		expect(imageElement).toBeInTheDocument();
	});
});
