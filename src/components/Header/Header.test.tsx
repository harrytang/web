import { render, screen } from "@testing-library/react";
import Header from "./Header";

const mockUsePathname = jest.fn();
const mockGetMenus = jest.fn();

jest.mock("next/navigation", () => ({
	usePathname: () => mockUsePathname(),
}));

jest.mock("@/lib/menus", () => ({
	getMenus: () => mockGetMenus(),
}));

jest.mock("@/components/Container", () => ({
	Container: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="container">{children}</div>
	),
}));

jest.mock("./Avatar", () => ({
	__esModule: true,
	default: ({ large }: { large?: boolean }) => (
		<div data-testid={large ? "avatar-large" : "avatar"} />
	),
}));

jest.mock("./AvatarContainer", () => ({
	__esModule: true,
	default: ({ children }: { children?: React.ReactNode }) => (
		<div data-testid="avatar-container">{children}</div>
	),
}));

jest.mock("./DesktopNavigation", () => ({
	__esModule: true,
	default: ({ items }: { items: { path: string; name: string }[] }) => (
		<div data-testid="desktop-navigation">
			{items.map((i) => i.name).join(",")}
		</div>
	),
}));

jest.mock("./MobileNavigation", () => ({
	__esModule: true,
	default: ({ items }: { items: { path: string; name: string }[] }) => (
		<div data-testid="mobile-navigation">
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

		jest.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
			x: 0,
			y: 0,
			top: 0,
			left: 0,
			right: 0,
			bottom: 64,
			width: 100,
			height: 64,
			toJSON: () => ({}),
		});
	});

	afterEach(() => {
		jest.restoreAllMocks();
		mockUsePathname.mockReset();
		mockGetMenus.mockReset();
	});

	it("renders homepage avatar layout when on root path", () => {
		mockUsePathname.mockReturnValue("/");
		render(<Header />);

		expect(screen.getByTestId("avatar-large")).toBeInTheDocument();
		expect(screen.queryByTestId("avatar")).not.toBeInTheDocument();
		expect(screen.getAllByTestId("container")).toHaveLength(2);
	});

	it("renders compact avatar layout on non-home paths", () => {
		mockUsePathname.mockReturnValue("/about");
		const { container } = render(<Header />);

		expect(screen.queryByTestId("avatar-large")).not.toBeInTheDocument();
		expect(screen.getByTestId("avatar")).toBeInTheDocument();
		expect(
			container.querySelector("div[style*='var(--content-offset)']"),
		).not.toBeInTheDocument();
	});

	it("passes menu items to both desktop and mobile navigation", () => {
		mockUsePathname.mockReturnValue("/");
		render(<Header />);

		expect(screen.getByTestId("desktop-navigation")).toHaveTextContent(
			"Home,About",
		);
		expect(screen.getByTestId("mobile-navigation")).toHaveTextContent(
			"Home,About",
		);
		expect(mockGetMenus).toHaveBeenCalled();
	});

	it("registers and cleans up scroll/resize listeners", () => {
		mockUsePathname.mockReturnValue("/");
		const addEventListenerSpy = jest.spyOn(window, "addEventListener");
		const removeEventListenerSpy = jest.spyOn(window, "removeEventListener");

		const { unmount } = render(<Header />);

		expect(addEventListenerSpy).toHaveBeenCalledWith(
			"scroll",
			expect.any(Function),
			{ passive: true },
		);
		expect(addEventListenerSpy).toHaveBeenCalledWith(
			"resize",
			expect.any(Function),
		);

		unmount();

		expect(removeEventListenerSpy).toHaveBeenCalledWith(
			"scroll",
			expect.any(Function),
		);
		expect(removeEventListenerSpy).toHaveBeenCalledWith(
			"resize",
			expect.any(Function),
		);
	});
});
