import NavLink from "./NavLink";

const Footer: React.FC = () => {
	const menus = [
		{
			name: "Cookie Policy",
			path: "/cookie-policy",
		},
		{
			name: "Disclaimer",
			path: "/disclaimer",
		},
		{
			name: "Privacy Policy",
			path: "/privacy-policy",
		},
		{
			name: "Terms of Use",
			path: "/terms-of-use",
		},
		{
			name: "Credits",
			path: "/credits",
		},
		{
			name: "Buy Me a Coffee",
			path: process.env.NEXT_PUBLIC_BMC_URL ?? "#",
		},
		{
			name: "Status",
			path: process.env.NEXT_PUBLIC_STATUS_URL ?? "#",
		},
	];
	return (
		<footer className="mt-24 flex-none border-t border-line">
			<div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-12 lg:flex-row lg:items-center lg:justify-between lg:px-8">
				<nav
					aria-label="Footer"
					className="flex flex-wrap gap-x-8 gap-y-3 text-sm/6"
				>
					{menus.map((menu) => (
						<NavLink key={menu.path} href={menu.path}>
							{menu.name}
						</NavLink>
					))}
				</nav>
				<p className="text-sm/6 text-muted">
					&copy; {new Date().getFullYear()} {process.env.NEXT_PUBLIC_SITE_NAME}.
					All rights reserved.{" "}
					<span className="whitespace-nowrap">
						Hosted by{" "}
						<a
							href="https://maxspell.com/cloud-hosting"
							target="_blank"
							rel="noopener noreferrer"
							className="font-medium text-ink underline decoration-line underline-offset-4 transition hover:text-accent hover:decoration-accent"
						>
							Maxspell
						</a>
					</span>
				</p>
			</div>
		</footer>
	);
};

export default Footer;
