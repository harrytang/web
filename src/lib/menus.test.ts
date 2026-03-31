import { getMenus } from "./menus";

describe("getMenus", () => {
	it("returns the expected navigation menu items in order", () => {
		expect(getMenus()).toEqual([
			{ name: "Home", path: "/" },
			{ name: "About", path: "/about" },
			{ name: "Articles", path: "/articles" },
			{ name: "Projects", path: "/projects" },
			{ name: "Expertise", path: "/expertise" },
			{ name: "Gear", path: "/gear" },
		]);
	});
});
