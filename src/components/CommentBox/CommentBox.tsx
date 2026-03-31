import { useTheme } from "next-themes";
import { Fragment, useEffect, useState } from "react";

type RemarkConfig = {
	host: string;
	site_id: string;
	url: string;
	theme: string;
	no_footer: boolean;
	components?: string[];
};

type Remark42Api = {
	destroy: () => void;
	createInstance: (config: RemarkConfig) => void;
};

declare global {
	interface Window {
		REMARK42?: Remark42Api;
		remark_config?: RemarkConfig;
	}
}

const insertScript = (
	id: string,
	parentElement: HTMLElement,
	theme: string,
	location: string,
) => {
	const script = window.document.createElement("script");
	script.type = "text/javascript";
	script.async = true;
	script.id = id;
	let url = location || window.location.origin + window.location.pathname;
	if (!url.startsWith("http://") && !url.startsWith("https://")) {
		url = window.location.origin + url;
	}
	if (url.endsWith("/")) {
		url = url.slice(0, -1);
	}
	script.innerHTML = `
	var remark_config = {
	  host: "${process.env.NEXT_PUBLIC_REMARK42_HOST}",
	  site_id: "${process.env.NEXT_PUBLIC_REMARK42_SITE_ID}",
	  url: "${url}",
	  theme: "${theme}",
	  no_footer: true,
	};
	!function(e,n){for(var o=0;o<e.length;o++){var r=n.createElement("script"),c=".js",d=n.head||n.body;"noModule"in r?(r.type="module",c=".mjs"):r.async=!0,r.defer=!0,r.src=remark_config.host+"/web/"+e[o]+c,d.appendChild(r)}}(remark_config.components||["embed"],document);`;
	parentElement.appendChild(script);
};

const removeScript = (id: string, parentElement: HTMLElement) => {
	const script = window.document.getElementById(id);
	if (script) {
		parentElement.removeChild(script);
	}
};

const manageScript = (location: string, theme: string) => {
	if (typeof window === "undefined") {
		return () => {};
	}
	const { document } = window;
	if (document.getElementById("remark42")) {
		insertScript("comments-script", document.body, theme, location);
	}
	return () => removeScript("comments-script", document.body);
};

const getPreferredTheme = (theme: string) => {
	if (typeof window === "undefined") {
		return theme;
	}
	if (theme === "system") {
		const prefersDark =
			window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
		return prefersDark ? "dark" : "light";
	}
	return theme;
};

type CommentBoxProps = {
	location: string;
};

export default function CommentBox({ location }: CommentBoxProps) {
	const { theme } = useTheme();
	const [preferredTheme, setPreferredTheme] = useState(
		getPreferredTheme(theme ?? "system"),
	);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		const handleSystemThemeChange = (e: MediaQueryListEvent) => {
			if (theme === "system") {
				setPreferredTheme(e.matches ? "dark" : "light");
			}
		};

		if (theme === "system") {
			const mediaQueryList = window.matchMedia("(prefers-color-scheme: dark)");
			mediaQueryList.addEventListener("change", handleSystemThemeChange);
			setPreferredTheme(mediaQueryList.matches ? "dark" : "light");

			return () => {
				mediaQueryList.removeEventListener("change", handleSystemThemeChange);
			};
		} else {
			setPreferredTheme(theme ?? "system");
		}
	}, [theme]);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		return manageScript(location, preferredTheme);
	}, [location, preferredTheme]);

	return (
		<Fragment>
			<h2>Comments</h2>
			<div id="remark42" />
		</Fragment>
	);
}
