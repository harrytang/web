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

	it("gives the results panel a dark variant instead of a bare light gray", async () => {
		const ui = await Page();
		render(ui);

		const panel = screen.getByTestId("cse").parentElement;
		expect(panel).toHaveClass("bg-zinc-100", "dark:bg-zinc-800/50");
		expect(panel).not.toHaveClass("bg-gray-100");
	});

	it("exposes a page heading for assistive tech", async () => {
		const ui = await Page();
		render(ui);

		expect(
			screen.getByRole("heading", { level: 1, name: "Search articles" }),
		).toHaveClass("sr-only");
	});
});
