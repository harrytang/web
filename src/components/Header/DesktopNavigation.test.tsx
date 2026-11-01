import { render } from "@testing-library/react";
import "@testing-library/jest-dom";
import type { Menu } from "@/lib/menus";
import DesktopNavigation from "./DesktopNavigation";

const menuItems: Menu[] = [
	{ path: "/home", name: "Home" },
	{ path: "/about", name: "About" },
	{ path: "/contact", name: "Contact" },
];

describe("DesktopNavigation", () => {
	it("renders the navigation as a rounded pill", () => {
		const { container } = render(<DesktopNavigation items={menuItems} />);

		const navElement = container.querySelector("nav");
		const ulElement = container.querySelector("ul");

		expect(navElement).toBeInTheDocument();
		expect(ulElement).toBeInTheDocument();
		expect(ulElement).toHaveClass(
			"flex",
			"rounded-full",
			"bg-raised/70",
			"ring-1",
			"ring-line",
		);
	});

	it("renders NavItem components correctly", () => {
		const { getByText } = render(<DesktopNavigation items={menuItems} />);

		menuItems.forEach((item) => {
			const navItemElement = getByText(item.name);
			expect(navItemElement).toBeInTheDocument();
			expect(navItemElement).toHaveAttribute("href", item.path);
		});
	});

	it("names the nav landmark and does not leak items onto the DOM node", () => {
		const { container } = render(<DesktopNavigation items={menuItems} />);

		const navElement = container.querySelector("nav");
		expect(navElement).toHaveAttribute("aria-label", "Main");
		expect(navElement).not.toHaveAttribute("items");
	});

	it("passes additional props to the nav element", () => {
		const { container } = render(
			<DesktopNavigation items={menuItems} data-testid="desktop-navigation" />,
		);

		const navElement = container.querySelector("nav");
		expect(navElement).toHaveAttribute("data-testid", "desktop-navigation");
	});
});
