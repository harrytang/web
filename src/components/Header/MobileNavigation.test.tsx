import { fireEvent, render, screen } from "@testing-library/react";
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

	it("does not leak the items prop onto the DOM and names the panel landmark", () => {
		const { container } = render(<MobileNavigation items={menuItems} />);

		expect(container.querySelector("[items]")).toBeNull();
		fireEvent.click(screen.getByText("Menu"));
		expect(
			screen.getByRole("navigation", { name: "Mobile" }),
		).toBeInTheDocument();
	});
});
