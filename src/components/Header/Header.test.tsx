import { render, screen } from "@testing-library/react";
import Header from "./Header";

const mockGetMenus = jest.fn();

jest.mock("@/lib/menus", () => ({
	getMenus: () => mockGetMenus(),
}));

jest.mock("./Avatar", () => ({
	__esModule: true,
	default: () => <div data-testid="avatar" />,
}));

jest.mock("./DesktopNavigation", () => ({
	__esModule: true,
	default: ({
		items,
		className,
	}: {
		items: { path: string; name: string }[];
		className?: string;
	}) => (
		<div data-testid="desktop-navigation" className={className}>
			{items.map((i) => i.name).join(",")}
		</div>
	),
}));

jest.mock("./MobileNavigation", () => ({
	__esModule: true,
	default: ({
		items,
		className,
	}: {
		items: { path: string; name: string }[];
		className?: string;
	}) => (
		<div data-testid="mobile-navigation" className={className}>
			{items.map((i) => i.name).join(",")}
		</div>
	),
}));

jest.mock("./ThemeToggle", () => ({
	__esModule: true,
	default: () => <div data-testid="theme-toggle" />,
}));

describe("Header", () => {
	beforeEach(() => {
		mockGetMenus.mockReturnValue([
			{ path: "/", name: "Home" },
			{ path: "/about", name: "About" },
		]);
	});

	afterEach(() => {
		mockGetMenus.mockReset();
	});

	it("renders the avatar, both navigations and the theme toggle", () => {
		render(<Header />);

		expect(screen.getByTestId("avatar")).toBeInTheDocument();
		expect(screen.getByTestId("desktop-navigation")).toBeInTheDocument();
		expect(screen.getByTestId("mobile-navigation")).toBeInTheDocument();
		expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();
	});

	it("passes menu items to both desktop and mobile navigation", () => {
		render(<Header />);

		expect(screen.getByTestId("desktop-navigation")).toHaveTextContent(
			"Home,About",
		);
		expect(screen.getByTestId("mobile-navigation")).toHaveTextContent(
			"Home,About",
		);
		expect(mockGetMenus).toHaveBeenCalled();
	});

	it("is a sticky banner that stays above the page content", () => {
		render(<Header />);

		const banner = screen.getByRole("banner");
		expect(banner).toHaveClass("sticky", "top-0", "z-50");
	});

	it("shows the pill navigation from md up and the menu button below md", () => {
		render(<Header />);

		expect(screen.getByTestId("desktop-navigation")).toHaveClass(
			"hidden",
			"md:block",
		);
		expect(screen.getByTestId("mobile-navigation")).toHaveClass("md:hidden");
	});
});
