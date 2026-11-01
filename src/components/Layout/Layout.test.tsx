import { render, screen } from "@testing-library/react";
import Layout from "./Layout";

jest.mock("@/components/Header/Header", () => () => (
	<div data-testid="header">Header</div>
));

jest.mock("@/components/Footer/Footer", () => () => (
	<div data-testid="footer">Footer</div>
));

describe("Layout", () => {
	it("renders the Layout component with Header, Footer, and children", () => {
		const childrenContent = "Test children content";

		render(
			<Layout>
				<div data-testid="children">{childrenContent}</div>
			</Layout>,
		);

		// Check if Header is rendered
		expect(screen.getByTestId("header")).toBeInTheDocument();

		// Check if Footer is rendered
		expect(screen.getByTestId("footer")).toBeInTheDocument();

		// Check if children content is rendered
		expect(screen.getByTestId("children")).toBeInTheDocument();
		expect(screen.getByText(childrenContent)).toBeInTheDocument();
	});

	it("has the correct structure and styles", () => {
		render(
			<Layout>
				<div data-testid="children">Test children content</div>
			</Layout>,
		);

		const relativeDiv = document.querySelector(
			".relative.flex.w-full.flex-col",
		);
		const mainElement = document.querySelector("main.flex-auto");

		// The page is full-bleed: no fixed backdrop column behind the content
		expect(document.querySelector(".fixed.inset-0")).not.toBeInTheDocument();

		// Check if the relative div is rendered correctly
		expect(relativeDiv).toBeInTheDocument();

		// Check if the main element is rendered correctly
		expect(mainElement).toBeInTheDocument();
	});

	it("offers a skip link that targets the main landmark", () => {
		render(
			<Layout>
				<div>Content</div>
			</Layout>,
		);

		const skipLink = screen.getByRole("link", { name: "Skip to content" });
		expect(skipLink).toHaveAttribute("href", "#main-content");
		expect(skipLink).toHaveClass("sr-only", "focus:not-sr-only");

		const main = screen.getByRole("main");
		expect(main).toHaveAttribute("id", "main-content");
		expect(main).toHaveAttribute("tabindex", "-1");
	});

	it("places the skip link before the header so it is the first tab stop", () => {
		render(
			<Layout>
				<div>Content</div>
			</Layout>,
		);

		const skipLink = screen.getByRole("link", { name: "Skip to content" });
		const header = screen.getByTestId("header");

		expect(
			skipLink.compareDocumentPosition(header) &
				Node.DOCUMENT_POSITION_FOLLOWING,
		).toBeTruthy();
	});
});
