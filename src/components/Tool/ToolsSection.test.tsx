import { render, screen } from "@testing-library/react";
import ToolsSection from "./ToolsSection";

jest.mock("../Section", () => ({
	Section: ({
		title,
		children,
		...props
	}: {
		title: string;
		children: React.ReactNode;
		[key: string]: unknown;
	}) => (
		<section {...props}>
			<h2>{title}</h2>
			<div>{children}</div>
		</section>
	),
}));

describe("ToolsSection", () => {
	it("renders unordered list with list role", () => {
		render(
			<ToolsSection title="Tools">
				<li>Tool 1</li>
			</ToolsSection>,
		);

		const list = screen.getByRole("list");
		expect(list).toBeInTheDocument();
	});

	it("renders list with correct spacing class", () => {
		const { container } = render(
			<ToolsSection title="Tools">
				<li>Tool 1</li>
			</ToolsSection>,
		);

		const list = container.querySelector("ul");
		expect(list).toHaveClass("space-y-16");
	});

	it("renders children as list items", () => {
		render(
			<ToolsSection title="Tools">
				<li>VS Code</li>
				<li>Terminal</li>
			</ToolsSection>,
		);

		expect(screen.getByText("VS Code")).toBeInTheDocument();
		expect(screen.getByText("Terminal")).toBeInTheDocument();
	});

	it("passes title to Section component", () => {
		render(
			<ToolsSection title="My Tools">
				<li>Tool</li>
			</ToolsSection>,
		);

		expect(screen.getByText("My Tools")).toBeInTheDocument();
	});

	it("renders within section element", () => {
		const { container } = render(
			<ToolsSection title="Tools">
				<li>Tool 1</li>
			</ToolsSection>,
		);

		expect(container.querySelector("section")).toBeInTheDocument();
	});

	it("renders multiple children", () => {
		render(
			<ToolsSection title="Tools">
				<li>Tool A</li>
				<li>Tool B</li>
				<li>Tool C</li>
			</ToolsSection>,
		);

		const listItems = screen.getAllByText(/Tool [ABC]/);
		expect(listItems).toHaveLength(3);
	});
});
