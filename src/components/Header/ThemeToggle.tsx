"use client";
import { MoonIcon, SunIcon } from "@heroicons/react/20/solid";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeToggle: React.FC = () => {
	const { resolvedTheme, setTheme } = useTheme();
	const otherTheme = resolvedTheme === "dark" ? "light" : "dark";
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<button
			type="button"
			aria-label={mounted ? `Switch to ${otherTheme} theme` : "Toggle theme"}
			className="grid size-10 cursor-pointer place-items-center rounded-full bg-raised/70 text-muted ring-1 ring-line transition hover:text-accent hover:ring-accent/40"
			onClick={() => setTheme(otherTheme)}
		>
			<SunIcon className="size-5 dark:hidden" />
			<MoonIcon className="hidden size-5 dark:block" />
		</button>
	);
};

export default ThemeToggle;
