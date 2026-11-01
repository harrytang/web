"use client";
import clsx from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItemProps = {
	href: string;
	children: React.ReactNode;
};

const NavItem: React.FC<NavItemProps> = ({ href, children }) => {
	const pathname = usePathname() || "";
	const isActive = pathname === href || pathname.startsWith(`${href}/`);

	return (
		<li>
			<Link
				href={href}
				aria-current={isActive ? "page" : undefined}
				className={clsx(
					"block rounded-full px-4 py-2 transition",
					isActive ? "bg-accent-soft text-accent" : "text-muted hover:text-ink",
				)}
			>
				{children}
			</Link>
		</li>
	);
};

export default NavItem;
