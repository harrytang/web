import { render, screen } from "@testing-library/react";
import type { Menu } from "@/lib/menus";
import MobileNavigation from "./MobileNavigation";

// Mock data for the menu items
const menuItems: Menu[] = [
	{ name: "Home", path: "/" },
	{ name: "About", path: "/about" },
	{ name: "Contact", path: "/contact" },
];

describe("MobileNavigation", () => {
	it("renders the menu button", () => {
		render(<MobileNavigation items={menuItems} />);
		expect(screen.getByText("Menu")).toBeInTheDocument();
	});
});
