import { render } from "@testing-library/react";
import { usePathname } from "next/navigation";
import NavItem from "./NavItem";

// Mocking next/navigation usePathname hook
jest.mock("next/navigation", () => ({
	usePathname: jest.fn(),
}));

describe("NavItem", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("marks the current page as active when the path matches", () => {
		(usePathname as jest.Mock).mockReturnValue("/active-path");

		const { getByText } = render(
			<NavItem href="/active-path">Active Link</NavItem>,
		);

		const linkElement = getByText("Active Link");
		expect(linkElement).toHaveAttribute("aria-current", "page");
		expect(linkElement).toHaveClass("bg-accent-soft", "text-accent");
		expect(linkElement).not.toHaveClass("text-muted");
	});

	it("renders the muted hover style when the path does not match", () => {
		(usePathname as jest.Mock).mockReturnValue("/different-path");

		const { getByText } = render(
			<NavItem href="/inactive-path">Inactive Link</NavItem>,
		);

		const linkElement = getByText("Inactive Link");
		expect(linkElement).not.toHaveAttribute("aria-current");
		expect(linkElement).toHaveClass("text-muted", "hover:text-ink");
		expect(linkElement).not.toHaveClass("bg-accent-soft");
	});

	it("renders children correctly", () => {
		(usePathname as jest.Mock).mockReturnValue("/active-path");

		const { getByText } = render(
			<NavItem href="/active-path">
				<span>Child Element</span>
			</NavItem>,
		);

		const childElement = getByText("Child Element");
		expect(childElement).toBeInTheDocument();
	});

	it("treats nested paths as active", () => {
		(usePathname as jest.Mock).mockReturnValue("/active-path/details");

		const { getByText } = render(
			<NavItem href="/active-path">Active Nested Link</NavItem>,
		);

		const linkElement = getByText("Active Nested Link");
		expect(linkElement).toHaveAttribute("aria-current", "page");
		expect(linkElement).toHaveClass("text-accent");
	});

	it("only marks Home active on the root path", () => {
		(usePathname as jest.Mock).mockReturnValue("/about");

		const { getByText } = render(<NavItem href="/">Home</NavItem>);

		expect(getByText("Home")).not.toHaveAttribute("aria-current");
	});

	it("falls back to empty pathname when router pathname is unavailable", () => {
		(usePathname as jest.Mock).mockReturnValue(undefined);

		const { getByText } = render(
			<NavItem href="/active-path">Fallback Path Link</NavItem>,
		);

		const linkElement = getByText("Fallback Path Link");
		expect(linkElement).not.toHaveAttribute("aria-current");
		expect(linkElement).toHaveClass("text-muted", "hover:text-ink");
	});
});
