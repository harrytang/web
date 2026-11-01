import { render, screen } from "@testing-library/react";
import type React from "react";
import Page from "./page";

jest.mock("@/components/SimpleLayout", () => ({
	SimpleLayout: ({
		children,
		seachBox,
	}: {
		children: React.ReactNode;
		seachBox?: boolean;
	}) => (
		<section data-testid="simple-layout" data-search-box={String(seachBox)}>
			{children}
		</section>
	),
}));

jest.mock("@/components/CSE", () => ({
	CSE: ({ type }: { type: string }) => <div data-testid="cse">CSE {type}</div>,
}));

describe("search page", () => {
	it("renders the search layout and cse results block", async () => {
		const ui = await Page();
		render(ui);

		expect(screen.getByTestId("simple-layout")).toHaveAttribute(
			"data-search-box",
			"true",
		);
		expect(screen.getByTestId("cse")).toHaveTextContent("CSE searchresults");
	});

	it("puts the results on a themed surface that follows the light and dark tokens", async () => {
		const ui = await Page();
		render(ui);

		const panel = screen.getByTestId("cse").parentElement;
		expect(panel).toHaveClass("bg-raised", "ring-line");
		expect(panel).not.toHaveClass("bg-zinc-100");
	});

	it("passes the visible 'Search articles' subtitle to the layout, which owns the single h1", async () => {
		const ui = await Page();
		expect(ui.props.subtitle).toBe("Search articles");
	});
});
