import { readFileSync } from "node:fs";
import path from "node:path";

const css = readFileSync(path.join(__dirname, "custom.css"), "utf8");

type Rule = { selectors: string[]; body: string };

const rules: Rule[] = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(
	([, selector, body]) => ({
		selectors: selector
			.replace(/\/\*[\s\S]*?\*\//g, "")
			.split(",")
			.map((s) => s.trim())
			.filter(Boolean),
		body,
	}),
);

const tokenColorRules = rules.filter(
	({ selectors, body }) =>
		selectors.some((s) => s.includes(".hljs-")) && /(^|[\s;])color:/.test(body),
);

describe("custom.css syntax highlighting", () => {
	it("scopes every light-palette token color to light mode so github-dark colors survive in dark mode", () => {
		const unscoped = tokenColorRules.flatMap(({ selectors }) =>
			selectors.filter((s) => !s.startsWith(":root:not(.dark)")),
		);

		expect(tokenColorRules.length).toBeGreaterThan(0);
		expect(unscoped).toEqual([]);
	});

	it("colors .hljs-attr in the light palette so it is not left on the pale dark-theme blue", () => {
		const attr = tokenColorRules.find(({ selectors }) =>
			selectors.some((s) => s.endsWith(".hljs-attr")),
		);

		expect(attr).toBeDefined();
		expect(attr?.body).toMatch(/color:\s*#[0-9a-f]{6}/i);
	});
});

describe("custom.css reduced motion", () => {
	const block = css.match(
		/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n\}/,
	)?.[1];

	it("neutralises transitions and animations when the user prefers reduced motion", () => {
		expect(block).toBeDefined();
		expect(block).toMatch(/transition-duration:\s*0\.01ms\s*!important/);
		expect(block).toMatch(/animation-duration:\s*0\.01ms\s*!important/);
	});

	it("does not let a shortened infinite animation strobe", () => {
		expect(block).toMatch(/animation-iteration-count:\s*1\s*!important/);
	});
});
