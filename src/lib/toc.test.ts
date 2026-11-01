import { createSlugger, extractHeadings, slugify } from "./toc";

describe("slugify", () => {
	it("lowercases and joins words with hyphens", () => {
		expect(slugify("Get paid globally")).toBe("get-paid-globally");
	});

	it("drops punctuation", () => {
		expect(slugify("Why passively?")).toBe("why-passively");
		expect(slugify("Get paid globally: Wise and Payoneer")).toBe(
			"get-paid-globally-wise-and-payoneer",
		);
	});

	it("keeps non-latin letters and digits", () => {
		expect(slugify("Cài đặt 2 bước")).toBe("cài-đặt-2-bước");
	});

	it("collapses and trims separators", () => {
		expect(slugify("  --Hello,   World!--  ")).toBe("hello-world");
	});

	it("falls back to a placeholder when nothing usable remains", () => {
		expect(slugify("???")).toBe("section");
	});
});

describe("createSlugger", () => {
	it("returns the plain slug the first time", () => {
		const slug = createSlugger();

		expect(slug("Introduction")).toBe("introduction");
	});

	it("numbers repeated headings so every id is unique", () => {
		const slug = createSlugger();

		expect([slug("Intro"), slug("Intro"), slug("Intro")]).toEqual([
			"intro",
			"intro-1",
			"intro-2",
		]);
	});

	it("does not reuse an id that a numbered heading already took", () => {
		const slug = createSlugger();

		expect([slug("Intro"), slug("Intro"), slug("Intro 1")]).toEqual([
			"intro",
			"intro-1",
			"intro-1-1",
		]);
	});

	it("keeps separate instances independent", () => {
		const first = createSlugger();
		const second = createSlugger();

		first("Intro");
		expect(second("Intro")).toBe("intro");
	});
});

describe("extractHeadings", () => {
	it("returns h2 and h3 headings in document order", () => {
		const content = [
			"Some intro text.",
			"",
			"## Introduction",
			"Text",
			"### Details",
			"More text",
			"## Conclusion",
		].join("\n");

		expect(extractHeadings(content)).toEqual([
			{ id: "introduction", text: "Introduction", level: 2, line: 3 },
			{ id: "details", text: "Details", level: 3, line: 5 },
			{ id: "conclusion", text: "Conclusion", level: 2, line: 7 },
		]);
	});

	it("records the 1-based source line so a renderer can match each heading", () => {
		const content = ["intro", "", "```", "## code", "```", "## Real"].join(
			"\n",
		);

		expect(extractHeadings(content)).toEqual([
			{ id: "real", text: "Real", level: 2, line: 6 },
		]);
	});

	it("returns an empty list when there are no headings", () => {
		expect(extractHeadings("Just a paragraph.")).toEqual([]);
		expect(extractHeadings("")).toEqual([]);
	});

	it("ignores h1 and h4+ headings", () => {
		const content = [
			"# Title",
			"## Kept",
			"#### Too deep",
			"##### Deeper",
		].join("\n");

		expect(extractHeadings(content).map((h) => h.text)).toEqual(["Kept"]);
	});

	it("ignores comment lines inside fenced code blocks", () => {
		const content = [
			"## Real heading",
			"```bash",
			"## not a heading",
			"### also not",
			"```",
			"~~~",
			"## still not",
			"~~~",
			"## Another real one",
		].join("\n");

		expect(extractHeadings(content).map((h) => h.text)).toEqual([
			"Real heading",
			"Another real one",
		]);
	});

	it("only closes a fence with the same marker and at least the same length", () => {
		const content = [
			"````md",
			"```",
			"## inside the outer fence",
			"```",
			"````",
			"## After the fence",
		].join("\n");

		expect(extractHeadings(content).map((h) => h.text)).toEqual([
			"After the fence",
		]);
	});

	it("ignores indented code and headings without a space after the hashes", () => {
		const content = ["    ## indented code", "##NoSpace", "## Proper"].join(
			"\n",
		);

		expect(extractHeadings(content).map((h) => h.text)).toEqual(["Proper"]);
	});

	it("strips inline markdown so the text matches what is rendered", () => {
		const content = [
			"## Use `kubectl` with **care**",
			"## Read the [docs](https://example.com/docs) now",
			"## An *emphasised* and ~~struck~~ heading",
			"## Run <kbd>ctrl</kbd> + c",
			"## Pictured ![logo](https://example.com/logo.png) here",
		].join("\n");

		expect(extractHeadings(content).map((h) => h.text)).toEqual([
			"Use kubectl with care",
			"Read the docs now",
			"An emphasised and struck heading",
			"Run ctrl + c",
			"Pictured  here",
		]);
	});

	it("keeps underscores that are part of a word", () => {
		expect(extractHeadings("## Set snake_case names")[0].text).toBe(
			"Set snake_case names",
		);
	});

	it("decodes common HTML entities", () => {
		expect(extractHeadings("## Terms &amp; Conditions")[0].text).toBe(
			"Terms & Conditions",
		);
	});

	it("removes closing hashes but keeps a hash inside a word", () => {
		expect(extractHeadings("## Title ##")[0].text).toBe("Title");
		expect(extractHeadings("## Learning C#")[0].text).toBe("Learning C#");
	});

	it("skips headings that have no text once markdown is stripped", () => {
		const content = ["## ![only](https://example.com/a.png)", "## Kept"].join(
			"\n",
		);

		expect(extractHeadings(content).map((h) => h.text)).toEqual(["Kept"]);
	});

	it("gives repeated headings unique ids", () => {
		const content = ["## Setup", "## Setup", "### Setup"].join("\n");

		expect(extractHeadings(content).map((h) => h.id)).toEqual([
			"setup",
			"setup-1",
			"setup-2",
		]);
	});

	it("drops backslash escapes so the text matches what is rendered", () => {
		const content = ["## snake\\_case and \\*stars\\*", "## Price \\# 1"].join(
			"\n",
		);

		expect(extractHeadings(content).map((h) => h.text)).toEqual([
			"snake_case and *stars*",
			"Price # 1",
		]);
	});

	it("skips headings inside HTML comments", () => {
		const content = [
			"## Kept",
			"<!--",
			"## Hidden",
			"-->",
			"<!-- ## Inline hidden -->",
			"## Also kept",
		].join("\n");

		expect(extractHeadings(content).map((h) => h.text)).toEqual([
			"Kept",
			"Also kept",
		]);
	});

	it("never hands out the id of the page's main landmark", () => {
		const [item] = extractHeadings("## Main content");

		expect(item.id).not.toBe("main-content");
		expect(item.id).toBe("main-content-1");
	});

	it("handles Windows line endings", () => {
		expect(extractHeadings("## One\r\ntext\r\n### Two\r\n")).toEqual([
			{ id: "one", text: "One", level: 2, line: 1 },
			{ id: "two", text: "Two", level: 3, line: 3 },
		]);
	});
});
