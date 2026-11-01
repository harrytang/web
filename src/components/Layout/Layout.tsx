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
				className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-md focus:bg-raised focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-ink focus:shadow-lg focus:ring-2 focus:ring-accent"
			>
				Skip to content
			</a>
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
