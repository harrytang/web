import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

type LayoutProps = {
	children: React.ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
	return (
		<>
			<a
				href="#main-content"
				className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-zinc-900 focus:shadow-lg focus:ring-2 focus:ring-amber-600 dark:focus:bg-zinc-800 dark:focus:text-zinc-100 dark:focus:ring-amber-400"
			>
				Skip to content
			</a>
			<div className="fixed inset-0 flex justify-center sm:px-8">
				<div className="flex w-full max-w-7xl lg:px-8">
					<div className="w-full bg-white ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-300/20" />
				</div>
			</div>
			<div className="relative flex w-full flex-col">
				<Header />
				<main
					id="main-content"
					tabIndex={-1}
					className="flex-auto focus:outline-none"
				>
					{children}
				</main>
				<Footer />
			</div>
		</>
	);
};

export default Layout;
