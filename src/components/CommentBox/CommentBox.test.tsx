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

		// A fresh page: the embed has not been loaded yet.
		window.REMARK42 = undefined;
		window.remark_config = undefined;
	});

	afterEach(() => {
		document.getElementById("comments-script")?.remove();
		window.REMARK42 = undefined;
		window.remark_config = undefined;
		jest.clearAllMocks();
	});

	/** What the embed puts on the page once its script has run. */
	const loadEmbed = () => {
		const api = {
			changeTheme: jest.fn(),
			destroy: jest.fn(),
			createInstance: jest.fn(),
		};
		window.REMARK42 = api;
		return api;
	};

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

	it("switches a loaded embed to the new theme when the site theme changes", async () => {
		const { rerender } = render(
			<CommentBox location="https://site.example/blog/test" />,
		);
		await waitFor(() => {
			expect(document.getElementById("comments-script")).toBeInTheDocument();
		});
		const embed = loadEmbed();
		const script = document.getElementById("comments-script");

		setMockTheme("dark");
		rerender(<CommentBox location="https://site.example/blog/test" />);

		await waitFor(() => {
			expect(embed.changeTheme).toHaveBeenCalledWith("dark");
		});
		// The embed is a one-shot module, so re-inserting its script would do
		// nothing: the same script stays and no new instance is created.
		expect(document.getElementById("comments-script")).toBe(script);
		expect(embed.createInstance).not.toHaveBeenCalled();
		expect(embed.destroy).not.toHaveBeenCalled();
	});

	it("switches a loaded embed back to light", async () => {
		setMockTheme("dark");
		const { rerender } = render(
			<CommentBox location="https://site.example/blog/test" />,
		);
		await waitFor(() => {
			expect(document.getElementById("comments-script")).toBeInTheDocument();
		});
		const embed = loadEmbed();

		setMockTheme("light");
		rerender(<CommentBox location="https://site.example/blog/test" />);

		await waitFor(() => {
			expect(embed.changeTheme).toHaveBeenCalledWith("light");
		});
	});

	it("follows the system theme live through the embed", async () => {
		setMockTheme("system");
		render(<CommentBox location="https://site.example/blog/test" />);
		await waitFor(() => {
			expect(document.getElementById("comments-script")).toBeInTheDocument();
		});
		const embed = loadEmbed();

		act(() => {
			mediaChangeHandler?.({ matches: true } as MediaQueryListEvent);
		});
		await waitFor(() => {
			expect(embed.changeTheme).toHaveBeenLastCalledWith("dark");
		});

		act(() => {
			mediaChangeHandler?.({ matches: false } as MediaQueryListEvent);
		});
		await waitFor(() => {
			expect(embed.changeTheme).toHaveBeenLastCalledWith("light");
		});
	});

	it("keeps the config current so an embed that loads late starts in the right theme", async () => {
		const { rerender } = render(
			<CommentBox location="https://site.example/blog/test" />,
		);
		await waitFor(() => {
			expect(document.getElementById("comments-script")).toBeInTheDocument();
		});
		// The inline script defines remark_config; jsdom does not run it.
		window.remark_config = {
			host: "https://comments.example",
			site_id: "site-123",
			url: "https://site.example/blog/test",
			theme: "light",
			no_footer: true,
		};

		setMockTheme("dark");
		rerender(<CommentBox location="https://site.example/blog/test" />);

		await waitFor(() => {
			expect(window.remark_config?.theme).toBe("dark");
		});
	});

	it("creates a fresh instance, not a second script, when the embed is already loaded", async () => {
		// Client-side navigation to another post: the module has already run.
		const embed = loadEmbed();

		render(<CommentBox location="https://site.example/blog/two" />);

		await waitFor(() => {
			expect(embed.createInstance).toHaveBeenCalledTimes(1);
		});
		expect(embed.createInstance).toHaveBeenCalledWith(
			expect.objectContaining({
				url: "https://site.example/blog/two",
				theme: "light",
				no_footer: true,
				site_id: expect.any(String),
				host: expect.any(String),
			}),
		);
		expect(window.remark_config?.url).toBe("https://site.example/blog/two");
		expect(document.getElementById("comments-script")).not.toBeInTheDocument();
	});

	it("tears down the previous instance before creating one for a new post", async () => {
		const embed = loadEmbed();
		const order: string[] = [];
		embed.destroy.mockImplementation(() => order.push("destroy"));
		embed.createInstance.mockImplementation(() => order.push("create"));

		render(<CommentBox location="https://site.example/blog/two" />);

		await waitFor(() => {
			expect(order).toEqual(["destroy", "create"]);
		});
	});

	it("destroys the embed instance when the comments unmount", async () => {
		const embed = loadEmbed();
		const { unmount } = render(
			<CommentBox location="https://site.example/blog/two" />,
		);
		await waitFor(() => {
			expect(embed.createInstance).toHaveBeenCalled();
		});
		embed.destroy.mockClear();

		unmount();

		expect(embed.destroy).toHaveBeenCalledTimes(1);
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

	it("trims trailing slash for absolute location URLs", async () => {
		render(<CommentBox location="https://site.example/blog/test/" />);

		await waitFor(() => {
			const script = document.getElementById("comments-script");
			expect(script?.innerHTML).toContain(
				'url: "https://site.example/blog/test"',
			);
		});
	});

	it("falls back to current location when location prop is empty", async () => {
		render(<CommentBox location="" />);

		await waitFor(() => {
			const script = document.getElementById("comments-script");
			expect(script?.innerHTML).toContain(window.location.origin);
		});
	});

	it("resolves to the OS theme, never the literal 'system', when the theme hook has no value yet", async () => {
		setMockTheme(undefined);
		(window.matchMedia as jest.Mock).mockReturnValue({
			matches: true,
			addEventListener: addEventListenerMock,
			removeEventListener: removeEventListenerMock,
		});
		const { rerender } = render(
			<CommentBox location="https://site.example/blog/test" />,
		);
		await waitFor(() => {
			expect(window.remark_config?.theme).toBe("dark");
		});
		const embed = loadEmbed();

		rerender(<CommentBox location="https://site.example/blog/test" />);

		expect(embed.changeTheme).not.toHaveBeenCalledWith("system");
		expect(window.remark_config?.theme).toBe("dark");
	});

	it("falls back to light when matchMedia is missing and the theme hook has no value", async () => {
		setMockTheme(undefined);
		Object.defineProperty(window, "matchMedia", {
			writable: true,
			value: undefined,
		});

		render(<CommentBox location="https://site.example/blog/test" />);

		await waitFor(() => {
			expect(document.getElementById("comments-script")).toBeInTheDocument();
		});
		await waitFor(() => {
			expect(window.remark_config?.theme).toBe("light");
		});
	});
});
