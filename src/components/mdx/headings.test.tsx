import { render } from "@testing-library/react";
import { Fragment, StrictMode } from "react";
import { extractHeadings } from "@/lib/toc";
import { MarkdownRenderer } from "./index";

type HeadingProps = {
	node?: { position?: { start: { line: number } } };
	children?: React.ReactNode;
};

// Jest cannot load the ESM-only react-markdown (jest.setup.ts stubs it), so this
// fake does what the real one does for headings: it calls the supplied heading
// component with the heading's 1-based source line. The real parser's line
// numbers are proven end to end by the table-of-contents e2e spec.
jest.mock("react-markdown", () => ({
	__esModule: true,
	default: ({
		children,
		components,
	}: {
		children: string;
		components: {
			h2: (props: HeadingProps) => JSX.Element;
			h3: (props: HeadingProps) => JSX.Element;
		};
	}) => {
		let fenced = false;
		return (
			<>
				{String(children)
					.split("\n")
					.map((line, index) => {
						if (/^```/.test(line)) {
							fenced = !fenced;
							return null;
						}
						const match = fenced ? null : /^(#{2,4}) (.+)$/.exec(line);
						if (!match) {
							return null;
						}
						const props = {
							node: { position: { start: { line: index + 1 } } },
							children: match[2],
						};
						const key = `${index}-${line}`;
						if (match[1].length === 2) {
							return <Fragment key={key}>{components.h2(props)}</Fragment>;
						}
						if (match[1].length === 3) {
							return <Fragment key={key}>{components.h3(props)}</Fragment>;
						}
						return <h4 key={key}>{match[2]}</h4>;
					})}
			</>
		);
	},
}));
jest.mock("remark-gfm", () => ({ __esModule: true, default: () => {} }));
jest.mock("rehype-highlight", () => ({ __esModule: true, default: () => {} }));

const article = [
	"Intro paragraph.",
	"",
	"## Why passively?",
	"Text.",
	"",
	"### Use kubectl with care",
	"",
	"```bash",
	"## a comment, not a heading",
	"```",
	"",
	"## Why passively?",
	"",
	"#### Too deep",
	"",
	"## Conclusion",
].join("\n");

const idsOf = (container: HTMLElement, selector: string) =>
	Array.from(container.querySelectorAll(selector)).map((el) => el.id);

describe("MarkdownRenderer heading anchors", () => {
	it("gives h2 and h3 headings an id", () => {
		const { container } = render(<MarkdownRenderer content={article} />);

		expect(idsOf(container, "h2, h3")).toEqual([
			"why-passively",
			"use-kubectl-with-care",
			"why-passively-1",
			"conclusion",
		]);
	});

	it("matches the table of contents exactly, so every link has a target", () => {
		const { container } = render(<MarkdownRenderer content={article} />);

		const tocIds = extractHeadings(article).map((item) => item.id);
		expect(idsOf(container, "h2, h3")).toEqual(tocIds);
		for (const id of tocIds) {
			expect(container.querySelector(`[id="${id}"]`)).toBeInTheDocument();
		}
	});

	it("keeps the same ids under React Strict Mode's double render", () => {
		const { container } = render(
			<StrictMode>
				<MarkdownRenderer content={article} />
			</StrictMode>,
		);

		expect(idsOf(container, "h2, h3")).toEqual(
			extractHeadings(article).map((item) => item.id),
		);
	});

	it("leaves other heading levels without an id", () => {
		const { container } = render(<MarkdownRenderer content={article} />);

		expect(container.querySelector("h4")).not.toHaveAttribute("id");
	});

	it("keeps the heading text", () => {
		const { container } = render(<MarkdownRenderer content={article} />);

		expect(container.querySelector("h3")).toHaveTextContent(
			"Use kubectl with care",
		);
	});
});
