import { render, screen } from "@testing-library/react";
import { Fragment } from "react";
import Biography from "./Biography";

type HeadingProps = { children?: React.ReactNode };

// Jest cannot load the ESM-only react-markdown (jest.setup.ts stubs it). This
// fake mirrors what it does for this content: "## " and "### " blocks go
// through the supplied heading components, **bold** becomes <strong>, and
// everything else is a paragraph.
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
		const inline = (text: string) =>
			text
				.split(/(\*\*[^*]+\*\*)/)
				.filter(Boolean)
				.map((part) =>
					part.startsWith("**") ? (
						<strong key={part}>{part.slice(2, -2)}</strong>
					) : (
						part
					),
				);

		return (
			<>
				{String(children)
					.split("\n\n")
					.map((block) => {
						if (block.startsWith("### ")) {
							return (
								<Fragment key={block}>
									{components.h3({ children: inline(block.slice(4)) })}
								</Fragment>
							);
						}
						if (block.startsWith("## ")) {
							return (
								<Fragment key={block}>
									{components.h2({ children: inline(block.slice(3)) })}
								</Fragment>
							);
						}
						return <p key={block}>{inline(block)}</p>;
					})}
			</>
		);
	},
}));

const content = [
	"Harry is a builder based in Espoo.",
	"## **Expertise**",
	"He designs robust IT solutions.",
	"### A smaller point",
	"Detail.",
	"## **Hobbies**",
	"Outside of work he enjoys **badminton** and travel.",
].join("\n\n");

describe("Biography", () => {
	it("renders every block of the biography in order", () => {
		const { container } = render(<Biography content={content} />);

		expect(container.textContent).toBe(
			"Harry is a builder based in Espoo.ExpertiseHe designs robust IT solutions.A smaller pointDetail.HobbiesOutside of work he enjoys badminton and travel.",
		);
	});

	it("styles the section headings as small accent labels", () => {
		render(<Biography content={content} />);

		const headings = screen.getAllByRole("heading", { level: 2 });
		expect(headings.map((h) => h.textContent)).toEqual([
			"Expertise",
			"Hobbies",
		]);
		for (const heading of headings) {
			expect(heading).toHaveClass("text-accent", "uppercase", "font-semibold");
		}
	});

	it("keeps the bold text inside a heading", () => {
		render(<Biography content={content} />);

		const [first] = screen.getAllByRole("heading", { level: 2 });
		expect(first.querySelector("strong")).toHaveTextContent("Expertise");
	});

	it("styles sub-headings below the labels", () => {
		render(<Biography content={content} />);

		expect(screen.getByRole("heading", { level: 3 })).toHaveClass(
			"text-ink",
			"font-semibold",
		);
	});

	it("leaves paragraphs as paragraphs, bold words included", () => {
		const { container } = render(<Biography content={content} />);

		const paragraphs = Array.from(container.querySelectorAll("p"));
		expect(paragraphs).toHaveLength(4);
		expect(paragraphs[3].querySelector("strong")).toHaveTextContent(
			"badminton",
		);
	});

	it("accepts a className for placement", () => {
		const { container } = render(
			<Biography content="Just text." className="mt-8" />,
		);

		expect(container.firstElementChild).toHaveClass("mt-8");
	});

	it("renders no headings for an empty biography", () => {
		render(<Biography content="" />);

		expect(screen.queryByRole("heading")).toBeNull();
	});
});
