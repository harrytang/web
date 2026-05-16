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
		expect(imageElement).toHaveClass("h-9 w-9");
	});

	it("renders correctly with large prop", () => {
		const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Site";
		const { getByAltText } = render(<Avatar large />);

		const imageElement = getByAltText(siteName);
		expect(imageElement).toHaveClass("h-16 w-16");
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

	it("has pointer-events-auto class", () => {
		const { container } = render(<Avatar />);

		const linkElement = container.querySelector("a");
		expect(linkElement).toHaveClass("pointer-events-auto");
	});

	it("falls back to default site name and empty avatar url when env vars are missing", () => {
		delete process.env.NEXT_PUBLIC_AVATAR_URL;
		delete process.env.NEXT_PUBLIC_SITE_NAME;

		const { getByAltText } = render(<Avatar />);
		const imageElement = getByAltText("Site");
		expect(imageElement).toBeInTheDocument();
	});
});
