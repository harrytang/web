import { render, screen } from "@testing-library/react";
import type React from "react";
import Pagination from "./Pagination";

jest.mock("next/link", () => ({
	__esModule: true,
	default: ({
		children,
		href,
		className,
		...props
	}: {
		children: React.ReactNode;
		href: string;
		className?: string;
	}) => (
		<a href={href} className={className} {...props}>
			{children}
		</a>
	),
}));

jest.mock("@heroicons/react/20/solid", () => ({
	ArrowLongLeftIcon: () => <span data-testid="arrow-left" />,
	ArrowLongRightIcon: () => <span data-testid="arrow-right" />,
}));

describe("Pagination", () => {
	it("renders nothing when only one page exists", () => {
		const { container } = render(<Pagination totalPages={1} currentPage={1} />);
		expect(container.firstChild).toBeNull();
	});

	it("renders the first-page state with next link and trailing ellipsis", () => {
		render(<Pagination totalPages={5} currentPage={1} />);

		expect(screen.queryByRole("link", { name: "Previous" })).not.toBeInTheDocument();
		expect(screen.getByRole("link", { name: "1" })).toHaveAttribute(
			"href",
			"/articles",
		);
		expect(screen.getByRole("link", { name: "2" })).toHaveAttribute(
			"href",
			"/articles/2",
		);
		expect(screen.getByRole("link", { name: "3" })).toHaveAttribute(
			"href",
			"/articles/3",
		);
		expect(screen.getByRole("link", { name: "5" })).toHaveAttribute(
			"href",
			"/articles/5",
		);
		expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
			"href",
			"/articles/2",
		);
		expect(screen.getByText("...")).toBeInTheDocument();
	});

	it("renders second-page previous link to /articles and both side ranges", () => {
		render(<Pagination totalPages={5} currentPage={2} />);

		expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
			"href",
			"/articles",
		);
		expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
			"href",
			"/articles/3",
		);
		expect(screen.getByRole("link", { name: "1" })).toHaveAttribute(
			"href",
			"/articles",
		);
		expect(screen.getByRole("link", { name: "2" })).toHaveClass("font-bold");
		expect(screen.getByRole("link", { name: "3" })).toHaveAttribute(
			"href",
			"/articles/3",
		);
		expect(screen.getByRole("link", { name: "5" })).toHaveAttribute(
			"href",
			"/articles/5",
		);
	});

	it("renders middle and last-page states with leading ellipsis and without next on final page", () => {
		const { rerender } = render(<Pagination totalPages={7} currentPage={4} />);

		expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
			"href",
			"/articles/3",
		);
		expect(screen.getByRole("link", { name: "Next" })).toHaveAttribute(
			"href",
			"/articles/5",
		);
		expect(screen.getAllByText("...")).toHaveLength(2);
		expect(screen.getByRole("link", { name: "1" })).toHaveAttribute(
			"href",
			"/articles",
		);
		expect(screen.getByRole("link", { name: "7" })).toHaveAttribute(
			"href",
			"/articles/7",
		);

		rerender(<Pagination totalPages={7} currentPage={7} />);

		expect(screen.getByRole("link", { name: "Previous" })).toHaveAttribute(
			"href",
			"/articles/6",
		);
		expect(screen.queryByRole("link", { name: "Next" })).not.toBeInTheDocument();
		expect(screen.getByRole("link", { name: "5" })).toHaveAttribute(
			"href",
			"/articles/5",
		);
		expect(screen.getByRole("link", { name: "6" })).toHaveAttribute(
			"href",
			"/articles/6",
		);
		expect(screen.getByRole("link", { name: "7" })).toHaveClass("font-bold");
	});
});