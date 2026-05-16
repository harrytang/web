import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import { Layout } from "@/components/Layout";

import "@/styles/tailwind.css";
import "@/styles/custom.css";

type RootLayoutProps = {
	children: React.ReactNode;
};

export const metadata: Metadata = {
	title: {
		template: `%s - ${process.env.NEXT_PUBLIC_SITE_NAME}`,
		default: `${process.env.NEXT_PUBLIC_SITE_NAME}`,
	},
};

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
	return (
		<html
			lang="en"
			className="dark h-full antialiased"
			suppressHydrationWarning
		>
			<head />
			<body className="flex h-full bg-zinc-50 dark:bg-black">
				<Providers>
					<div className="flex w-full">
						<Layout>{children}</Layout>
					</div>
				</Providers>
			</body>
		</html>
	);
};

export default RootLayout;
