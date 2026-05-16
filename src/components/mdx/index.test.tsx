import {
	act,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { isInternalLink } from "@/lib/helper";
import { MarkdownRenderer } from "./index";

jest.mock("react-markdown", () => ({
	__esModule: true,
	default: ({
		children,
		components,
	}: {
		children: string;
		components?: {
			code?: (props: {
				className?: string;
				children?: React.ReactNode;
			}) => JSX.Element;
			img?: (props: {
				src?: string | number;
				alt?: string;
				node?: unknown;
			}) => JSX.Element;
			a?: (props: { href?: string; children: React.ReactNode }) => JSX.Element;
		};
	}) => {
		const content = String(children);

		if (content.startsWith("## ")) {
			return <h2>{content.slice(3)}</h2>;
		}

		const imageMatch = content.match(/^!\[(.*)\]\((.*)\)$/);
		if (imageMatch && components?.img) {
			return components.img({ src: imageMatch[2], alt: imageMatch[1] });
		}

		if (content === "IMG_NON_STRING_SRC" && components?.img) {
			return components.img({ src: 123, alt: "numeric src" });
		}

		const linkMatch = content.match(/^\[(.*)\]\((.*)\)$/);
		if (linkMatch && components?.a) {
			return components.a({ href: linkMatch[2], children: linkMatch[1] });
		}

		if (content === "NO_HREF_LINK" && components?.a) {
			return components.a({ children: "NoHref" });
		}

		const codeMatch = content.match(/^```(\w+)\n([\s\S]*)```$/);
		if (codeMatch && components?.code) {
			return components.code({
				className: `language-${codeMatch[1]}`,
				children: codeMatch[2],
			});
		}

		if (content === "CODE_COMPLEX_CHILDREN" && components?.code) {
			return components.code({
				className: "language-bash",
				children: [
					"docker compose run --,",
					<span key="label">sh.acme.autoload.domain=example.com</span>,
					", \\\n  -e DEPLOY_DOCKER_CONTAINER_LABEL=,",
					<span key="same">sh.acme.autoload.domain=example.com</span>,
				],
			});
		}

		if (content === "CODE_INLINE" && components?.code) {
			return components.code({
				children: "echo hello",
			});
		}

		if (content === "CODE_BOOLEAN_CHILD" && components?.code) {
			return components.code({
				className: "language-bash",
				children: [false, "echo ok"],
			});
		}

		return <>{content}</>;
	},
}));

jest.mock("remark-gfm", () => ({
	__esModule: true,
	default: () => {},
}));

jest.mock("rehype-highlight", () => ({
	__esModule: true,
	default: () => {},
}));

jest.mock("@/lib/helper", () => ({
	isInternalLink: jest.fn(),
}));

jest.mock("next/image", () => ({
	__esModule: true,
	default: (props: { src: string; alt: string }) => (
		<div
			data-testid="markdown-image"
			data-src={props.src}
			data-alt={props.alt}
		/>
	),
}));

jest.mock("next/link", () => ({
	__esModule: true,
	default: ({
		href,
		children,
		...props
	}: {
		href: string;
		children: React.ReactNode;
		[key: string]: unknown;
	}) => (
		<a href={href} {...props}>
			{children}
		</a>
	),
}));

const mockedIsInternalLink = isInternalLink as jest.MockedFunction<
	typeof isInternalLink
>;

describe("MarkdownRenderer", () => {
	const writeText = jest.fn().mockResolvedValue(undefined);

	beforeEach(() => {
		mockedIsInternalLink.mockReset();
		writeText.mockClear();
		Object.defineProperty(global.navigator, "clipboard", {
			value: { writeText },
			configurable: true,
		});
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it("renders markdown text content", () => {
		render(<MarkdownRenderer content="## Hello markdown" />);

		expect(
			screen.getByRole("heading", { level: 2, name: "Hello markdown" }),
		).toBeInTheDocument();
	});

	it("renders markdown image with fallback alt text", () => {
		render(<MarkdownRenderer content="![](/image.jpg)" />);

		const image = screen.getByTestId("markdown-image");
		expect(image).toHaveAttribute("data-src", "/image.jpg");
		expect(image).toHaveAttribute("data-alt", "Markdown Image");
	});

	it("renders internal links through Next Link path", () => {
		mockedIsInternalLink.mockReturnValue(true);
		render(<MarkdownRenderer content="[About](/about)" />);

		const link = screen.getByRole("link", { name: "About" });
		expect(link).toHaveAttribute("href", "/about");
		expect(link).not.toHaveAttribute("target", "_blank");
		expect(mockedIsInternalLink).toHaveBeenCalledWith("/about");
	});

	it("renders external links with target blank", () => {
		mockedIsInternalLink.mockReturnValue(false);
		render(<MarkdownRenderer content="[GitHub](https://github.com)" />);

		const link = screen.getByRole("link", { name: "GitHub" });
		expect(link).toHaveAttribute("href", "https://github.com");
		expect(link).toHaveAttribute("target", "_blank");
		expect(mockedIsInternalLink).toHaveBeenCalledWith("https://github.com");
	});

	it("does not render image component when markdown image src is empty", () => {
		render(<MarkdownRenderer content="![NoSrc]()" />);

		expect(screen.queryByTestId("markdown-image")).not.toBeInTheDocument();
	});

	it("handles link with empty href via default value", () => {
		mockedIsInternalLink.mockReturnValue(false);
		render(<MarkdownRenderer content="[Empty]()" />);

		const anchor = screen.getByText("Empty").closest("a");
		expect(anchor).toHaveAttribute("href", "");
		expect(mockedIsInternalLink).toHaveBeenCalledWith("");
	});

	it("defaults href when markdown link omits href attribute", () => {
		mockedIsInternalLink.mockReturnValue(false);
		render(<MarkdownRenderer content="NO_HREF_LINK" />);

		const anchor = screen.getByText("NoHref").closest("a");
		expect(anchor).toHaveAttribute("href", "");
		expect(mockedIsInternalLink).toHaveBeenCalledWith("");
	});

	it("does not render image when src is not a string type", () => {
		render(<MarkdownRenderer content="IMG_NON_STRING_SRC" />);

		expect(screen.queryByTestId("markdown-image")).not.toBeInTheDocument();
	});

	it("renders copy button for fenced code blocks and copies code content", async () => {
		jest.useFakeTimers();

		render(
			<MarkdownRenderer content={"```yaml\nname: test\nenabled: true\n```"} />,
		);

		expect(screen.getByText("yaml")).toBeInTheDocument();
		const copyButton = screen.getByRole("button", { name: "Copy" });
		fireEvent.click(copyButton);

		expect(writeText).toHaveBeenCalledWith("name: test\nenabled: true");

		await waitFor(() => {
			expect(
				screen.getByRole("button", { name: "✓ Copied" }),
			).toBeInTheDocument();
		});

		act(() => {
			jest.advanceTimersByTime(3000);
		});

		await waitFor(() => {
			expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
		});

		jest.useRealTimers();
	});

	it("copies text content from highlighted token nodes without [object Object]", async () => {
		render(<MarkdownRenderer content="CODE_COMPLEX_CHILDREN" />);

		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy" }));
		});

		expect(writeText).toHaveBeenCalledTimes(1);
		const copiedText = writeText.mock.calls[0][0] as string;
		expect(copiedText).toContain(
			"-e DEPLOY_DOCKER_CONTAINER_LABEL=,sh.acme.autoload.domain=example.com",
		);
		expect(copiedText).not.toContain("[object Object]");
	});

	it("renders inline code without copy controls", () => {
		render(<MarkdownRenderer content="CODE_INLINE" />);

		expect(screen.getByText("echo hello")).toBeInTheDocument();
		expect(
			screen.queryByRole("button", { name: "Copy" }),
		).not.toBeInTheDocument();
	});

	it("handles clipboard-unavailable environment without changing copy state", async () => {
		Object.defineProperty(global.navigator, "clipboard", {
			value: undefined,
			configurable: true,
		});

		render(<MarkdownRenderer content={"```bash\necho hello\n```"} />);

		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy" }));
		});

		expect(writeText).not.toHaveBeenCalled();
		expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
	});

	it("clears previous copy timeout when copy is clicked repeatedly", async () => {
		jest.useFakeTimers();
		const clearTimeoutSpy = jest.spyOn(global, "clearTimeout");

		render(<MarkdownRenderer content={"```bash\necho hello\n```"} />);

		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy" }));
		});
		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "✓ Copied" }));
		});

		expect(clearTimeoutSpy).toHaveBeenCalled();
	});

	it("ignores non-text nodes while extracting code text", async () => {
		render(<MarkdownRenderer content="CODE_BOOLEAN_CHILD" />);

		await act(async () => {
			fireEvent.click(screen.getByRole("button", { name: "Copy" }));
		});

		expect(writeText).toHaveBeenCalledWith("echo ok");
	});
});
