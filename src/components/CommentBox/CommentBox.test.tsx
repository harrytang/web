import { act, render, screen, waitFor } from "@testing-library/react";
import { useTheme } from "next-themes";
import CommentBox from "./CommentBox";

jest.mock("next-themes", () => ({
	useTheme: jest.fn(),
}));

const mockedUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;

const setMockTheme = (theme: string | undefined) => {
	mockedUseTheme.mockReturnValue({
		theme,
		setTheme: jest.fn(),
		forcedTheme: undefined,
		resolvedTheme: theme,
		themes: ["light", "dark", "system"],
		systemTheme: "light",
	} as ReturnType<typeof useTheme>);
};

describe("CommentBox", () => {
	let addEventListenerMock: jest.Mock;
	let removeEventListenerMock: jest.Mock;
	let mediaChangeHandler: ((e: MediaQueryListEvent) => void) | undefined;

	beforeEach(() => {
		setMockTheme("light");

		mediaChangeHandler = undefined;
		addEventListenerMock = jest.fn(
			(event: string, cb: (e: MediaQueryListEvent) => void) => {
				if (event === "change") {
					mediaChangeHandler = cb;
				}
			},
		);
		removeEventListenerMock = jest.fn();

		Object.defineProperty(window, "matchMedia", {
			writable: true,
			value: jest.fn().mockImplementation(() => ({
				matches: false,
				addEventListener: addEventListenerMock,
				removeEventListener: removeEventListenerMock,
			})),
		});

		window.REMARK42 = {
			destroy: jest.fn(),
			createInstance: jest.fn(),
		};
		window.remark_config = { site_id: "site-123" };
	});

	afterEach(() => {
		document.getElementById("comments-script")?.remove();
		jest.clearAllMocks();
	});

	it("renders comments heading and container", () => {
		render(<CommentBox location="https://site.example/blog/test" />);

		expect(
			screen.getByRole("heading", { name: "Comments" }),
		).toBeInTheDocument();
		expect(document.getElementById("remark42")).toBeInTheDocument();
	});

	it("inserts remark42 script with configured host and light theme", async () => {
		render(<CommentBox location="https://site.example/blog/test" />);

		await waitFor(() => {
			expect(document.getElementById("comments-script")).toBeInTheDocument();
		});

		const script = document.getElementById("comments-script");
		expect(script?.innerHTML).toContain('host: "');
		expect(script?.innerHTML).toContain('site_id: "');
		expect(script?.innerHTML).toContain('theme: "light"');
	});

	it("uses dark theme when system preference is dark", async () => {
		setMockTheme("system");
		(window.matchMedia as jest.Mock).mockReturnValue({
			matches: true,
			addEventListener: addEventListenerMock,
			removeEventListener: removeEventListenerMock,
		});

		render(<CommentBox location="https://site.example/blog/test" />);

		await waitFor(() => {
			const script = document.getElementById("comments-script");
			expect(script?.innerHTML).toContain('theme: "dark"');
		});
	});

	it("updates script theme on system theme change event", async () => {
		setMockTheme("system");
		render(<CommentBox location="https://site.example/blog/test" />);

		await waitFor(() => {
			expect(document.getElementById("comments-script")).toBeInTheDocument();
		});

		act(() => {
			mediaChangeHandler?.({ matches: true } as MediaQueryListEvent);
		});

		await waitFor(() => {
			const script = document.getElementById("comments-script");
			expect(script?.innerHTML).toContain('theme: "dark"');
		});
	});

	it("keeps script on rerender and cleans script/listeners on unmount", async () => {
		setMockTheme("system");
		const { unmount, rerender } = render(
			<CommentBox location="https://site.example/blog/one" />,
		);

		await waitFor(() => {
			expect(document.getElementById("comments-script")).toBeInTheDocument();
		});

		rerender(<CommentBox location="https://site.example/blog/two" />);

		await waitFor(() => {
			expect(document.getElementById("comments-script")).toBeInTheDocument();
		});

		unmount();
		expect(document.getElementById("comments-script")).not.toBeInTheDocument();
		expect(removeEventListenerMock).toHaveBeenCalled();
	});

	it("handles relative location path and URL without trailing slash", async () => {
		render(<CommentBox location="/blog/test" />);

		await waitFor(() => {
			const script = document.getElementById("comments-script");
			expect(script?.innerHTML).toContain('url: "');
		});
	});
});
