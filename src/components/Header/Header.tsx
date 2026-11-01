import { getMenus } from "@/lib/menus";
import Avatar from "./Avatar";
import DesktopNavigation from "./DesktopNavigation";
import MobileNavigation from "./MobileNavigation";
import ThemeToggle from "./ThemeToggle";

const Header = () => {
	const menus = getMenus();

	return (
		// The blur lives on a pseudo-element: a `backdrop-filter` on the header itself
		// would make it the containing block for `fixed` children, shrinking the
		// mobile menu's backdrop and panel to the header's own box.
		<header className="sticky top-0 z-50 before:absolute before:inset-0 before:-z-10 before:bg-canvas/70 before:backdrop-blur-xl">
			<div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-6 px-6 py-3 lg:px-8">
				<div className="justify-self-start">
					<Avatar />
				</div>
				<DesktopNavigation items={menus} className="hidden md:block" />
				<div className="col-start-3 flex items-center justify-end gap-3">
					<ThemeToggle />
					<MobileNavigation items={menus} className="md:hidden" />
				</div>
			</div>
		</header>
	);
};

export default Header;
