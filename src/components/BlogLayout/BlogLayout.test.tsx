import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { AppContext } from "@/app/providers";
import type { Blog } from "@/lib/blogs";

const mockBack = jest.fn();

jest.mock("next/navigation", () => ({
	useRouter: () => ({ back: mockBack }),
}));

jest.mock("next/dynamic", () => ({
	__esModule: true,
	default: () => {
		return function DynamicComponent(props: Record<string, unknown>) {
			if (typeof props.location === "string") {
				return <div data-testid="comment-box">{props.location}</div>;
			}
			if (typeof props.url === "string") {
				return <div data-testid="react-player">{props.url}</div>;
			}
			return <div data-testid="dynamic-component" />;
		};
	},
}));

jest.mock("next/image", () => ({
	__esModule: true,
	default: (props: { alt: string; src: string }) => (
		<div data-testid="next-image" data-alt={props.alt} data-src={props.src} />
	),
}));

jest.mock("@heroicons/react/20/solid", () => ({
	ArrowLeftIcon: () => <div data-testid="arrow-left-icon" />,
	InformationCircleIcon: () => <div data-testid="info-icon" />,
	PlayCircleIcon: () => <div data-testid="play-icon" />,
}));

jest.mock("@/components/Container", () => ({
	Container: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="container">{children}</div>
	),
}));

jest.mock("@/components/Prose", () => ({
	Prose: ({ children }: { children: React.ReactNode }) => (
		<div data-testid="prose">{children}</div>
	),
}));

jest.mock("../mdx", () => ({
	MarkdownRenderer: ({ content }: { content: string }) => (
		<div data-testid="markdown">{content}</div>
	),
}));

jest.mock("./BMC", () => ({
	__esModule: true,
	default: () => <div data-testid="bmc" />,
}));

jest.mock("@/app/providers", () => ({
	AppContext: React.createContext<{ previousPathname?: string }>({}),
}));

import BlogLayout from "./BlogLayout";

const createBlog = (mediaUrl?: string): Blog => ({
	id: 1,
	attributes: {
		title: "Test Blog",
		slug: "test-blog",
		content: "Test markdown content",
		mediaUrl,
		locale: "en",
		createdAt: "2024-01-01T00:00:00.000Z",
		updatedAt: "2024-01-01T00:00:00.000Z",
		publishedAt: "2024-01-02T00:00:00.000Z",
		seo: {
			id: 1,
			metaTitle: "Meta title",
			metaDescription: "Meta description",
			keywords: "meta,keywords",
			metaRobots: null,
			structuredData: null,
			metaViewport: null,
			canonicalURL: null,
			metaImage: {
				data: {
					id: 10,
					attributes: {
						name: "cover",
						alternativeText: "Cover",
						caption: "Cover caption",
						width: 1200,
						height: 630,
						formats: {},
						hash: "hash",
						ext: ".jpg",
						mime: "image/jpeg",
						size: 100,
						url: "https://example.com/cover.jpg",
						previewUrl: null,
						provider: "local",
						provider_metadata: null,
						createdAt: "2024-01-01T00:00:00.000Z",
						updatedAt: "2024-01-01T00:00:00.000Z",
					},
				},
			},
			metaSocial: [],
		},
	},
});

describe("BlogLayout", () => {
	let intersectionCallback: IntersectionObserverCallback | undefined;
	let unobserveMock: jest.Mock;

	beforeEach(() => {
		mockBack.mockReset();
		process.env.NEXT_PUBLIC_SITE_URL = "https://site.example";
		unobserveMock = jest.fn();
		intersectionCallback = undefined;

		global.IntersectionObserver = jest
			.fn()
			.mockImplementation((callback: IntersectionObserverCallback) => {
				intersectionCallback = callback;
				return {
					observe: jest.fn(),
					unobserve: unobserveMock,
					disconnect: jest.fn(),
					takeRecords: jest.fn().mockReturnValue([]),
					root: null,
					rootMargin: "0px",
					thresholds: [1],
				};
			}) as unknown as typeof IntersectionObserver;
	});

	it("renders title, markdown, and static image branch", () => {
		render(<BlogLayout blog={createBlog()} />);

		expect(screen.getByText("Test Blog")).toBeInTheDocument();
		expect(screen.getByTestId("markdown")).toHaveTextContent(
			"Test markdown content",
		);
		expect(screen.getByTestId("next-image")).toHaveAttribute(
			"data-src",
			"https://example.com/cover.jpg",
		);
		expect(screen.getByText("Cover caption")).toBeInTheDocument();
	});

	it("renders back button and calls router.back", async () => {
		render(
			<AppContext.Provider value={{ previousPathname: "/articles" }}>
				<BlogLayout blog={createBlog()} />
			</AppContext.Provider>,
		);

		const backButton = screen.getByRole("button", {
			name: "Go back to articles",
		});
		expect(backButton).toBeInTheDocument();

		await userEvent.click(backButton);
		expect(mockBack).toHaveBeenCalledTimes(1);
	});

	it("renders video placeholder then player after clicking play", async () => {
		render(<BlogLayout blog={createBlog("https://video.example/test.mp4")} />);

		expect(
			screen.getByRole("button", { name: "Play Video" }),
		).toBeInTheDocument();
		expect(screen.queryByTestId("react-player")).not.toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: "Play Video" }));

		expect(screen.getByTestId("react-player")).toHaveTextContent(
			"https://video.example/test.mp4",
		);
	});

	it("lazy-loads comments when observer intersects and cleans up on unmount", async () => {
		const { unmount } = render(<BlogLayout blog={createBlog()} />);

		expect(screen.queryByTestId("comment-box")).not.toBeInTheDocument();
		expect(intersectionCallback).toBeDefined();

		act(() => {
			intersectionCallback?.(
				[{ isIntersecting: true } as IntersectionObserverEntry],
				{} as IntersectionObserver,
			);
		});

		await waitFor(() => {
			expect(screen.getByTestId("comment-box")).toHaveTextContent(
				"https://site.example/blog/test-blog",
			);
		});

		unmount();
		expect(unobserveMock).toHaveBeenCalledTimes(1);
	});
});
