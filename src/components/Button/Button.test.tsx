import { render, screen } from "@testing-library/react";
import Button from "./Button";

describe("Button", () => {
	it("renders a primary button by default", () => {
		render(<Button>Primary Button</Button>);
		const buttonElement = screen.getByRole("button", {
			name: /primary button/i,
		});

		expect(buttonElement).toBeInTheDocument();
		expect(buttonElement).toHaveClass("bg-accent", "text-canvas");
	});

	it("renders a secondary button when variant is secondary", () => {
		render(<Button variant="secondary">Secondary Button</Button>);
		const buttonElement = screen.getByRole("button", {
			name: /secondary button/i,
		});

		expect(buttonElement).toBeInTheDocument();
		expect(buttonElement).toHaveClass("bg-raised", "ring-1", "ring-line");
	});

	it("renders a link when href is provided", () => {
		render(<Button href="/test-link">Link Button</Button>);
		const linkElement = screen.getByRole("link", { name: /link button/i });

		expect(linkElement).toBeInTheDocument();
		expect(linkElement).toHaveClass(
			"inline-flex items-center gap-2 justify-center rounded-md py-2 px-3 text-sm outline-offset-2 transition active:transition-none",
		);
	});

	it("applies custom class names", () => {
		render(<Button className="custom-class">Custom Class Button</Button>);
		const buttonElement = screen.getByRole("button", {
			name: /custom class button/i,
		});

		expect(buttonElement).toBeInTheDocument();
		expect(buttonElement).toHaveClass("custom-class");
	});

	it("forwards additional props to the button element", () => {
		render(
			<Button data-testid="button" aria-label="Custom Button">
				Custom Button
			</Button>,
		);
		const buttonElement = screen.getByTestId("button");

		expect(buttonElement).toBeInTheDocument();
		expect(buttonElement).toHaveAttribute("aria-label", "Custom Button");
	});

	it("forwards additional props to the link element", () => {
		render(
			<Button href="/test-link" data-testid="link" aria-label="Custom Link">
				Custom Link
			</Button>,
		);
		const linkElement = screen.getByTestId("link");

		expect(linkElement).toBeInTheDocument();
		expect(linkElement).toHaveAttribute("aria-label", "Custom Link");
		expect(linkElement).toHaveAttribute("href", "/test-link");
	});

	it("has an explicit, visible keyboard focus style in both themes", () => {
		render(<Button>Focusable</Button>);

		expect(screen.getByRole("button", { name: "Focusable" })).toHaveClass(
			"focus-visible:outline-2",
			"focus-visible:outline-amber-600",
			"dark:focus-visible:outline-amber-400",
		);
	});

	it("dims and signals the not-allowed state when disabled", () => {
		render(<Button disabled>Unavailable</Button>);

		const button = screen.getByRole("button", { name: "Unavailable" });
		expect(button).toBeDisabled();
		expect(button).toHaveClass(
			"disabled:opacity-50",
			"disabled:cursor-not-allowed",
		);
	});
});
