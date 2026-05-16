"use client";

import { usePathname } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { createContext } from "react";
import { ThemeWatcher } from "@/components/ThemeWatcher";
import { usePrevious } from "@/hooks";

export const AppContext = createContext<{ previousPathname?: string }>({});

export function Providers({ children }: { children: React.ReactNode }) {
	const pathname = usePathname();
	const previousPathname = usePrevious(pathname);

	return (
		<AppContext.Provider value={{ previousPathname }}>
			<ThemeProvider attribute="class" disableTransitionOnChange>
				<ThemeWatcher />
				{children}
			</ThemeProvider>
		</AppContext.Provider>
	);
}
