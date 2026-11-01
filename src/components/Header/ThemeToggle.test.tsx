import { fireEvent, render } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useTheme } from "next-themes";
import ThemeToggle from "./ThemeToggle";

// Mocking next-themes useTheme hook
jest.mock("next-themes", () => ({
	useTheme: jest.fn(),
}));

describe("ThemeToggle", () => {
	let mockSetTheme: jest.Mock;
	let mockResolvedTheme: string;

	beforeEach(() => {
		jest.clearAllMocks();
		mockSetTheme = jest.fn();
		mockResolvedTheme = "light";
		(useTheme as jest.Mock).mockReturnValue({
			resolvedTheme: mockResolvedTheme,
			setTheme: mockSetTheme,
		});
	});

	it("renders correctly with light theme", () => {
		const { getByRole } = render(<ThemeToggle />);

		const buttonElement = getByRole("button");
		expect(buttonElement).toHaveAttribute("aria-label", "Switch to dark theme");
	});

	it("renders a sun for light mode and a moon for dark mode", () => {
		const { getByRole } = render(<ThemeToggle />);

		const [sunIcon, moonIcon] = Array.from(
			getByRole("button").querySelectorAll("svg"),
		);
		// The sun is hidden once the dark class is on <html>; the moon is the reverse.
		expect(sunIcon).toHaveClass("size-5", "dark:hidden");
		expect(moonIcon).toHaveClass("hidden", "size-5", "dark:block");
	});

	it("renders correctly with dark theme", () => {
		mockResolvedTheme = "dark";
		(useTheme as jest.Mock).mockReturnValue({
			resolvedTheme: mockResolvedTheme,
			setTheme: mockSetTheme,
		});

		const { getByRole } = render(<ThemeToggle />);

		const buttonElement = getByRole("button");
		expect(buttonElement).toHaveAttribute(
			"aria-label",
			"Switch to light theme",
		);
	});

	it("calls setTheme with the correct argument when clicked", () => {
		const { getByRole } = render(<ThemeToggle />);
		const buttonElement = getByRole("button");

		fireEvent.click(buttonElement);

		expect(mockSetTheme).toHaveBeenCalledWith("dark");
	});

	it("updates aria-label when theme is toggled", () => {
		const { getByRole, rerender } = render(<ThemeToggle />);

		const buttonElement = getByRole("button");
		expect(buttonElement).toHaveAttribute("aria-label", "Switch to dark theme");

		// Simulate theme change
		mockResolvedTheme = "dark";
		(useTheme as jest.Mock).mockReturnValue({
			resolvedTheme: mockResolvedTheme,
			setTheme: mockSetTheme,
		});
		rerender(<ThemeToggle />);

		expect(buttonElement).toHaveAttribute(
			"aria-label",
			"Switch to light theme",
		);
	});

	it("sets mounted state correctly", () => {
		const { getByRole } = render(<ThemeToggle />);
		const buttonElement = getByRole("button");

		expect(buttonElement).toHaveAttribute("aria-label", "Switch to dark theme");
	});
});
