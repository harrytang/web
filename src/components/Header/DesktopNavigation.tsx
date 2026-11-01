import type { Menu } from "@/lib/menus";
import NavItem from "./NavItem";

type DesktopNavigationProps = {
	items: Menu[];
} & React.ComponentPropsWithoutRef<"nav">;

const DesktopNavigation: React.FC<DesktopNavigationProps> = ({
	items,
	...props
}) => {
	return (
		<nav aria-label="Main" {...props}>
			<ul className="flex items-center gap-1 rounded-full bg-raised/70 p-1 text-sm font-medium text-ink ring-1 ring-line">
				{items.map((item) => (
					<NavItem key={item.path} href={item.path}>
						{item.name}
					</NavItem>
				))}
			</ul>
		</nav>
	);
};

export default DesktopNavigation;
