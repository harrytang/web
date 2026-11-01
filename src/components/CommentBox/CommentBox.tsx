import { useTheme } from "next-themes";
import { Fragment, useEffect, useRef, useState } from "react";

type RemarkConfig = {
	host: string;
	site_id: string;
	url: string;
	theme: string;
	no_footer: boolean;
	components?: string[];
};

/**
 * What the Remark42 embed puts on the page once its script has run. The embed
 * is an ES module, which the browser evaluates only once per page, so after the
 * first load it can only be driven through this object.
 */
type Remark42Api = {
	createInstance: (config: RemarkConfig) => void;
	/** Only present while an instance exists. */
	changeTheme?: (theme: string) => void;
	/** Only present while an instance exists. */
	destroy?: () => void;
};

declare global {
	interface Window {
		REMARK42?: Remark42Api;
		remark_config?: RemarkConfig;
	}
}

const normalizeUrl = (location: string) => {
	let url = location || window.location.origin + window.location.pathname;
	if (!url.startsWith("http://") && !url.startsWith("https://")) {
		url = window.location.origin + url;
	}
	if (url.endsWith("/")) {
		url = url.slice(0, -1);
	}
	return url;
};

const buildConfig = (location: string, theme: string): RemarkConfig => ({
	host: `${process.env.NEXT_PUBLIC_REMARK42_HOST}`,
	site_id: `${process.env.NEXT_PUBLIC_REMARK42_SITE_ID}`,
	url: normalizeUrl(location),
	theme,
	no_footer: true,
});

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
	const url = normalizeUrl(location);
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

const manageEmbed = (location: string, theme: string) => {
	const { document } = window;
	if (!document.getElementById("remark42")) {
		return undefined;
	}

	const embed = window.REMARK42;
	if (embed?.createInstance) {
		// Already loaded on this page (client-side navigation from another post):
		// the module will not run again, so build this post's instance directly.
		embed.destroy?.();
		window.remark_config = buildConfig(location, theme);
		embed.createInstance(window.remark_config);
	} else {
		insertScript("comments-script", document.body, theme, location);
	}

	return () => {
		window.REMARK42?.destroy?.();
		removeScript("comments-script", document.body);
	};
};

const getPreferredTheme = (theme: string) => {
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
			setPreferredTheme(getPreferredTheme(theme ?? "system"));
		}
	}, [theme]);

	// The theme the embed starts in. A later theme change must not rebuild the
	// embed (and cannot re-run its script), so it is read through a ref.
	const themeRef = useRef(preferredTheme);
	themeRef.current = preferredTheme;

	useEffect(() => manageEmbed(location, themeRef.current), [location]);

	// Follow the site theme live. Also keep the config current, so an embed that
	// is still loading starts in the right theme.
	useEffect(() => {
		if (window.remark_config) {
			window.remark_config.theme = preferredTheme;
		}
		window.REMARK42?.changeTheme?.(preferredTheme);
	}, [preferredTheme]);

	return (
		<Fragment>
			<h2>Comments</h2>
			<div id="remark42" />
		</Fragment>
	);
}
