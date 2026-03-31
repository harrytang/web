import { render } from "@testing-library/react";
import ThemeWatcher from "./ThemeWatcher";

jest.mock("next-themes", () => ({
	useTheme: jest.fn(),
}));

const { useTheme } = require("next-themes");

describe("ThemeWatcher", () => {
	let mockSetTheme: jest.Mock;
	let mockAddEventListener: jest.Mock;
	let mockRemoveEventListener: jest.Mock;
	let mockMatchMedia: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();

		mockSetTheme = jest.fn();
		mockAddEventListener = jest.fn();
		mockRemoveEventListener = jest.fn();

		mockMatchMedia = jest.fn(() => ({
			matches: false,
			addEventListener: mockAddEventListener,
			removeEventListener: mockRemoveEventListener,
		}));

		global.matchMedia = mockMatchMedia as unknown as typeof window.matchMedia;

		useTheme.mockReturnValue({
			resolvedTheme: "light",
			setTheme: mockSetTheme,
		});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it("renders null", () => {
		const { container } = render(<ThemeWatcher />);
		expect(container.firstChild).toBeNull();
	});

	it("creates media query listener for dark mode preference", () => {
		render(<ThemeWatcher />);

		expect(mockMatchMedia).toHaveBeenCalledWith("(prefers-color-scheme: dark)");
	});

	it("adds change event listener to media query", () => {
		render(<ThemeWatcher />);

		expect(mockAddEventListener).toHaveBeenCalledWith(
			"change",
			expect.any(Function),
		);
	});

	it("removes change event listener on unmount", () => {
		const { unmount } = render(<ThemeWatcher />);

		unmount();

		expect(mockRemoveEventListener).toHaveBeenCalledWith(
			"change",
			expect.any(Function),
		);
	});

	it("sets theme to system when system theme matches resolved theme", () => {
		mockMatchMedia.mockReturnValue({
			matches: true,
			addEventListener: mockAddEventListener,
			removeEventListener: mockRemoveEventListener,
		});

		useTheme.mockReturnValue({
			resolvedTheme: "dark",
			setTheme: mockSetTheme,
		});

		render(<ThemeWatcher />);

		expect(mockSetTheme).toHaveBeenCalledWith("system");
	});

	it("does not set theme when system theme does not match resolved theme", () => {
		mockMatchMedia.mockReturnValue({
			matches: false,
			addEventListener: mockAddEventListener,
			removeEventListener: mockRemoveEventListener,
		});

		useTheme.mockReturnValue({
			resolvedTheme: "dark",
			setTheme: mockSetTheme,
		});

		render(<ThemeWatcher />);

		expect(mockSetTheme).not.toHaveBeenCalled();
	});

	it("calls onMediaChange when theme preference changes", () => {
		let changeCallback: ((e: Event) => void) | undefined;

		mockAddEventListener.mockImplementation(
			(event: string, callback: (e: Event) => void) => {
				if (event === "change") {
					changeCallback = callback;
				}
			},
		);

		mockMatchMedia.mockReturnValue({
			matches: false,
			addEventListener: mockAddEventListener,
			removeEventListener: mockRemoveEventListener,
		});

		useTheme.mockReturnValue({
			resolvedTheme: "light",
			setTheme: mockSetTheme,
		});

		render(<ThemeWatcher />);

		// Simulate theme preference change to dark
		mockMatchMedia.mockReturnValue({
			matches: true,
			addEventListener: mockAddEventListener,
			removeEventListener: mockRemoveEventListener,
		});

		changeCallback?.(new Event("change"));

		expect(mockSetTheme).toHaveBeenCalledWith("system");
	});

	it("updates effect when resolvedTheme changes", () => {
		const { rerender } = render(<ThemeWatcher />);

		useTheme.mockReturnValue({
			resolvedTheme: "dark",
			setTheme: mockSetTheme,
		});

		mockMatchMedia.mockReturnValue({
			matches: true,
			addEventListener: mockAddEventListener,
			removeEventListener: mockRemoveEventListener,
		});

		rerender(<ThemeWatcher />);

		expect(mockSetTheme).toHaveBeenCalledWith("system");
	});
});
