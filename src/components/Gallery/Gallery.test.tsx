import { act, render, screen } from "@testing-library/react";
import type { Media } from "@/types/media";
import Gallery from "./Gallery";

jest.mock("next/image", () => ({
	__esModule: true,
	default: (props: {
		src: string;
		alt: string;
		width: number;
		height: number;
		priority?: boolean;
	}) => (
		<div
			data-testid="gallery-image"
			data-src={props.src}
			data-alt={props.alt}
			data-width={String(props.width)}
			data-height={String(props.height)}
			data-priority={String(Boolean(props.priority))}
		/>
	),
}));

const createMedia = (id: number, caption: string): Media => ({
	id,
	attributes: {
		name: `image-${id}`,
		alternativeText: caption,
		caption,
		width: 1200,
		height: 800,
		formats: {},
		hash: `hash-${id}`,
		ext: ".jpg",
		mime: "image/jpeg",
		size: 100,
		url: `https://example.com/${id}.jpg`,
		previewUrl: null,
		provider: "local",
		provider_metadata: null,
		createdAt: "2024-01-01",
		updatedAt: "2024-01-01",
	},
});

describe("Gallery", () => {
	const originalMatchMedia = window.matchMedia;
	const originalInnerWidth = window.innerWidth;

	beforeEach(() => {
		jest.useFakeTimers();
		Object.defineProperty(window, "matchMedia", {
			writable: true,
			value: jest.fn().mockReturnValue({ matches: false }),
		});
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			value: 1280,
		});
		jest.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		jest.clearAllTimers();
		jest.useRealTimers();
		(window.matchMedia as unknown) = originalMatchMedia;
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			value: originalInnerWidth,
		});
		jest.restoreAllMocks();
	});

	it("renders all provided gallery items", () => {
		const items = [createMedia(1, "First"), createMedia(2, "Second")];

		render(<Gallery items={items} />);

		const images = screen.getAllByTestId("gallery-image");
		expect(images).toHaveLength(2);
		expect(images[0]).toHaveAttribute("data-alt", "First");
		expect(images[1]).toHaveAttribute("data-alt", "Second");
	});

	it("marks middle image as priority", () => {
		const items = [
			createMedia(1, "One"),
			createMedia(2, "Two"),
			createMedia(3, "Three"),
		];

		render(<Gallery items={items} />);

		const images = screen.getAllByTestId("gallery-image");
		expect(images[0]).toHaveAttribute("data-priority", "false");
		expect(images[1]).toHaveAttribute("data-priority", "true");
		expect(images[2]).toHaveAttribute("data-priority", "false");
	});

	it("skips auto-rotate on large screens", () => {
		(window.matchMedia as jest.Mock).mockReturnValue({ matches: false });
		const items = [createMedia(1, "First"), createMedia(2, "Second")];

		render(<Gallery items={items} />);

		expect(console.log).toHaveBeenCalledWith(
			"Skipping auto-rotate on large screens",
		);
	});

	it("skips auto-rotate when only one item exists", () => {
		(window.matchMedia as jest.Mock).mockReturnValue({ matches: true });
		const items = [createMedia(1, "Only")];

		render(<Gallery items={items} />);

		expect(console.log).toHaveBeenCalledWith(
			"Skipping auto-rotate on large screens",
		);
	});

	it("starts slide animation on small screens after interval tick", () => {
		(window.matchMedia as jest.Mock).mockReturnValue({ matches: true });
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			value: 375,
		});
		const items = [
			createMedia(1, "First"),
			createMedia(2, "Second"),
			createMedia(3, "Third"),
		];

		render(<Gallery items={items} />);

		const images = screen.getAllByTestId("gallery-image");
		expect(images[0]).toHaveAttribute("data-alt", "First");
		expect(images[1]).toHaveAttribute("data-alt", "Second");
		expect(images[2]).toHaveAttribute("data-alt", "Third");

		act(() => {
			jest.advanceTimersByTime(5000);
		});

		const animatedWrapper = images[0].closest(".flex-none");
		expect(animatedWrapper).toHaveStyle({ transform: "translateX(-196px)" });
	});
});
