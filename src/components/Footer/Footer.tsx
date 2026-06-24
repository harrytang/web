import { ContainerInner, ContainerOuter } from "../Container";
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
		<footer className="mt-32 flex-none">
			<ContainerOuter>
				<div className="border-t border-zinc-100 pb-16 pt-10 dark:border-zinc-700/40">
					<ContainerInner>
						<div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
							<div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm font-medium text-zinc-800 dark:text-zinc-200">
								{menus.map((menu) => (
									<NavLink key={menu.path} href={menu.path}>
										{menu.name}
									</NavLink>
								))}
							</div>
							<p className="text-sm text-zinc-500 dark:text-zinc-400">
								&copy; {new Date().getFullYear()}{" "}
								{process.env.NEXT_PUBLIC_SITE_NAME}. All rights reserved.
							</p>
						</div>
						<p className="mt-6 flex items-end justify-center gap-2 text-center text-sm leading-none text-zinc-500 dark:text-zinc-400">
							<span className="relative top-px leading-none">Hosted by</span>
							<a
								href="https://maxspell.com/cloud-hosting"
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Maxspell cloud hosting"								
								className="inline-flex h-5 items-end leading-none hover:opacity-80 cursor-pointer"
							>
								<img
									src="https://maxspell.com/logo.svg"
									alt=""
									aria-hidden="true"
									className="block h-5 w-auto dark:hidden"
								/>
								<img
									src="https://maxspell.com/logo-dark.svg"
									alt=""
									aria-hidden="true"
									className="hidden h-5 w-auto dark:block"
								/>
							</a>
						</p>
					</ContainerInner>
				</div>
			</ContainerOuter>
		</footer>
	);
};

export default Footer;
