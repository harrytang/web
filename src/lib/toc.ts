export type TocItem = {
	id: string;
	text: string;
	level: 2 | 3;
	/** 1-based line in the markdown source, used to match the rendered heading. */
	line: number;
};

/** Turn heading text into a URL-safe, readable anchor (letters and digits kept in any script). */
export const slugify = (text: string): string => {
	const slug = text
		.toLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, "-")
		.replace(/^-+|-+$/g, "");
	return slug || "section";
};

/**
 * Returns a function that slugs headings and keeps every id unique.
 * The renderer and the table of contents each create their own, and because
 * both walk the headings in document order they arrive at the same ids.
 */
export const createSlugger = (reserved: readonly string[] = []) => {
	const used = new Set<string>(reserved);
	const repeats = new Map<string, number>();

	return (text: string): string => {
		const base = slugify(text);
		let id = base;
		while (used.has(id)) {
			const next = (repeats.get(base) ?? 0) + 1;
			repeats.set(base, next);
			id = `${base}-${next}`;
		}
		used.add(id);
		return id;
	};
};

const ENTITIES: Record<string, string> = {
	"&amp;": "&",
	"&lt;": "<",
	"&gt;": ">",
	"&quot;": '"',
	"&#39;": "'",
};

// A backslash escape is swapped for a placeholder so the emphasis rules below
// cannot eat the character, then swapped back once they have run.
const ESCAPE = /\\([!-/:-@[-`{-~])/g;
const PLACEHOLDER = /\uE000(\d+)\uE001/g;

/** Reduce the inline markdown of a heading to the plain text a reader sees. */
const toPlainText = (markdown: string): string =>
	markdown
		.replace(ESCAPE, (_, char: string) => `\uE000${char.charCodeAt(0)}\uE001`)
		.replace(/!\[[^\]]*\]\([^)]*\)/g, "")
		.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
		.replace(/<[^>]+>/g, "")
		.replace(/`+([^`]*)`+/g, "$1")
		.replace(/(\*\*|\*|~~)/g, "")
		// Underscore emphasis only counts at word edges, so snake_case survives.
		.replace(/(^|[^\p{L}\p{N}])(_{1,2})(?=\S)(.+?)\2(?![\p{L}\p{N}])/gu, "$1$3")
		.replace(/&(?:amp|lt|gt|quot|#39);/g, (entity) => ENTITIES[entity])
		.replace(PLACEHOLDER, (_, code: string) =>
			String.fromCharCode(Number(code)),
		)
		.trim();

const HEADING = /^ {0,3}(#{2,3})[ \t]+(.+?)(?:[ \t]+#+)?[ \t]*$/;
const FENCE = /^ {0,3}(`{3,}|~{3,})/;

/** The id of the page's `<main>`, which the skip link targets. */
const RESERVED_IDS = ["main-content"];

/**
 * Blank out HTML comments on one line. `inComment` carries an unclosed comment
 * over from the previous line; the returned flag says whether this line leaves
 * one open.
 */
const stripComments = (
	line: string,
	inComment: boolean,
): [text: string, inComment: boolean] => {
	let text = "";
	let rest = line;
	let open = inComment;

	while (rest) {
		if (open) {
			const end = rest.indexOf("-->");
			if (end === -1) {
				return [text, true];
			}
			rest = rest.slice(end + 3);
			open = false;
		} else {
			const start = rest.indexOf("<!--");
			if (start === -1) {
				return [text + rest, false];
			}
			text += rest.slice(0, start);
			rest = rest.slice(start + 4);
			open = true;
		}
	}

	return [text, open];
};

/** Read the h2 and h3 headings from article markdown, skipping fenced code. */
export const extractHeadings = (content: string): TocItem[] => {
	const slug = createSlugger(RESERVED_IDS);
	const items: TocItem[] = [];
	let fence: string | null = null;
	let inComment = false;

	for (const [index, rawLine] of content.split(/\r?\n/).entries()) {
		// Comments are only markup outside fenced code.
		let line = rawLine;
		if (fence === null) {
			[line, inComment] = stripComments(rawLine, inComment);
		}
		const fenceMatch = FENCE.exec(line);
		if (fenceMatch) {
			const marker = fenceMatch[1];
			if (fence === null) {
				fence = marker;
			} else if (
				marker[0] === fence[0] &&
				marker.length >= fence.length &&
				line.trim() === marker
			) {
				fence = null;
			}
			continue;
		}
		if (fence !== null) {
			continue;
		}

		const match = HEADING.exec(line);
		if (!match) {
			continue;
		}
		const text = toPlainText(match[2]);
		if (!text) {
			continue;
		}
		items.push({
			id: slug(text),
			text,
			level: match[1].length === 2 ? 2 : 3,
			line: index + 1,
		});
	}

	return items;
};
