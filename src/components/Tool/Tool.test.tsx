import { render, screen } from "@testing-library/react";
import Tool from "./Tool";

jest.mock("../Card", () => ({
	Card: ({
		as,
		children,
		...props
	}: {
		as?: React.ElementType;
		children: React.ReactNode;
		[key: string]: unknown;
	}) => {
		const Component = as || "div";
		return <Component {...props}>{children}</Component>;
	},
	CardTitle: ({
		as,
		href,
		children,
		...props
	}: {
		as?: React.ElementType;
		href?: string;
		children: React.ReactNode;
		[key: string]: unknown;
	}) => {
		const Component = as || "h2";
		return href ? (
			<Component>
				<a href={href} {...props}>
					{children}
				</a>
			</Component>
		) : (
			<Component {...props}>{children}</Component>
		);
	},
	CardDescription: ({ children }: { children: React.ReactNode }) => (
		<p>{children}</p>
	),
}));

describe("Tool", () => {
	it("renders tool title", () => {
		render(<Tool title="VS Code">A code editor by Microsoft</Tool>);

		expect(screen.getByText("VS Code")).toBeInTheDocument();
	});

	it("renders tool description as children", () => {
		render(<Tool title="VS Code">A code editor by Microsoft</Tool>);

		expect(screen.getByText("A code editor by Microsoft")).toBeInTheDocument();
	});

	it("renders as list item", () => {
		const { container } = render(<Tool title="VS Code">A code editor</Tool>);

		expect(container.querySelector("li")).toBeInTheDocument();
	});

	it("wraps title in link when href is provided", () => {
		render(
			<Tool title="VS Code" href="https://code.visualstudio.com">
				A code editor
			</Tool>,
		);

		const link = screen.getByRole("link", { name: "VS Code" });
		expect(link).toHaveAttribute("href", "https://code.visualstudio.com");
	});

	it("does not wrap title in link when href is not provided", () => {
		render(<Tool title="VS Code">A code editor</Tool>);

		expect(screen.queryByRole("link")).not.toBeInTheDocument();
	});

	it("renders h3 for title", () => {
		const { container } = render(<Tool title="VS Code">A code editor</Tool>);

		const h3 = container.querySelector("h3");
		expect(h3).toBeInTheDocument();
		expect(h3).toHaveTextContent("VS Code");
	});

	it("renders description paragraph", () => {
		const { container } = render(<Tool title="VS Code">A code editor</Tool>);

		const p = container.querySelector("p");
		expect(p).toBeInTheDocument();
		expect(p).toHaveTextContent("A code editor");
	});
});
