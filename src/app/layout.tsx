import clsx from "clsx";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Providers } from "@/app/providers";
import { Layout } from "@/components/Layout";

import "@/styles/tailwind.css";
import "@/styles/custom.css";

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist",
	display: "swap",
});

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
			className={clsx(geist.variable, "dark h-full antialiased")}
			suppressHydrationWarning
		>
			<head />
			<body className="flex min-h-full bg-canvas font-sans text-ink">
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
