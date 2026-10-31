import { act, fireEvent, render, screen } from "@testing-library/react";
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
	documentId: `media-${id}`,
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
});

// The gallery asks two media questions: is the screen narrower than the strip,
// and does the user prefer reduced motion. Answer them independently.
const mockMedia = ({
	small,
	reduced = false,
}: {
	small: boolean;
	reduced?: boolean;
}) => {
	(window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
		matches: query.includes("prefers-reduced-motion") ? reduced : small,
	}));
};

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

	it("skips auto-rotate on large screens without logging", () => {
		mockMedia({ small: false });
		const items = [createMedia(1, "First"), createMedia(2, "Second")];

		render(<Gallery items={items} />);
		act(() => {
			jest.advanceTimersByTime(5000);
		});

		expect(
			screen.getAllByTestId("gallery-image")[0].closest(".flex-none"),
		).toHaveStyle({ transform: "translateX(0)" });
		expect(console.log).not.toHaveBeenCalled();
	});

	it("skips auto-rotate when only one item exists", () => {
		mockMedia({ small: true });
		const items = [createMedia(1, "Only")];

		render(<Gallery items={items} />);
		act(() => {
			jest.advanceTimersByTime(5000);
		});

		expect(
			screen.getByTestId("gallery-image").closest(".flex-none"),
		).toHaveStyle({ transform: "translateX(0)" });
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("does not auto-rotate or offer a control when the user prefers reduced motion", () => {
		mockMedia({ small: true, reduced: true });
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			value: 375,
		});
		const items = [createMedia(1, "First"), createMedia(2, "Second")];

		render(<Gallery items={items} />);
		act(() => {
			jest.advanceTimersByTime(10000);
		});

		const images = screen.getAllByTestId("gallery-image");
		expect(images[0]).toHaveAttribute("data-alt", "First");
		expect(images[0].closest(".flex-none")).toHaveStyle({
			transform: "translateX(0)",
		});
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});

	it("lets the user pause and resume auto-rotation", () => {
		mockMedia({ small: true });
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			value: 375,
		});
		const items = [createMedia(1, "First"), createMedia(2, "Second")];

		render(<Gallery items={items} />);

		fireEvent.click(screen.getByRole("button", { name: "Pause slideshow" }));
		act(() => {
			jest.advanceTimersByTime(10000);
		});
		expect(
			screen.getAllByTestId("gallery-image")[0].closest(".flex-none"),
		).toHaveStyle({ transform: "translateX(0)" });

		fireEvent.click(screen.getByRole("button", { name: "Play slideshow" }));
		act(() => {
			jest.advanceTimersByTime(5000);
		});
		expect(
			screen.getAllByTestId("gallery-image")[0].closest(".flex-none"),
		).toHaveStyle({ transform: "translateX(-196px)" });
	});

	it("settles the slide instead of freezing mid-animation when paused", () => {
		mockMedia({ small: true });
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			value: 375,
		});
		const items = [createMedia(1, "First"), createMedia(2, "Second")];

		render(<Gallery items={items} />);
		act(() => {
			jest.advanceTimersByTime(5000);
		});
		fireEvent.click(screen.getByRole("button", { name: "Pause slideshow" }));

		expect(
			screen.getAllByTestId("gallery-image")[0].closest(".flex-none"),
		).toHaveStyle({ transform: "translateX(0)" });
	});

	it("starts slide animation on small screens after interval tick", () => {
		mockMedia({ small: true });
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

	it("syncs display items when props change", () => {
		const first = [createMedia(1, "First"), createMedia(2, "Second")];
		const second = [createMedia(3, "Third"), createMedia(4, "Fourth")];
		const { rerender } = render(<Gallery items={first} />);

		expect(screen.getAllByTestId("gallery-image")[0]).toHaveAttribute(
			"data-alt",
			"First",
		);

		rerender(<Gallery items={second} />);

		expect(screen.getAllByTestId("gallery-image")[0]).toHaveAttribute(
			"data-alt",
			"Third",
		);
	});

	it("applies animating then default styles during rotation lifecycle", () => {
		mockMedia({ small: true });
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			value: 375,
		});
		render(<Gallery items={[createMedia(1, "A"), createMedia(2, "B")]} />);

		act(() => {
			jest.advanceTimersByTime(5000);
		});

		let wrapper = screen
			.getAllByTestId("gallery-image")[0]
			.closest(".flex-none");
		expect(wrapper).toHaveStyle({
			opacity: "1",
			transform: "translateX(-196px)",
		});

		act(() => {
			jest.advanceTimersByTime(600);
		});

		wrapper = screen.getAllByTestId("gallery-image")[0].closest(".flex-none");
		expect(wrapper).toHaveStyle({
			opacity: "1",
			transform: "translateX(-196px)",
		});

		act(() => {
			jest.advanceTimersByTime(100);
		});

		wrapper = screen.getAllByTestId("gallery-image")[0].closest(".flex-none");
		expect(wrapper).toHaveStyle({ opacity: "1", transform: "translateX(0)" });
	});

	it("handles rotation setter shortcut when items reduce to one during animation", () => {
		mockMedia({ small: true });
		Object.defineProperty(window, "innerWidth", {
			writable: true,
			value: 375,
		});
		const { rerender } = render(
			<Gallery items={[createMedia(1, "A"), createMedia(2, "B")]} />,
		);

		act(() => {
			jest.advanceTimersByTime(5000);
		});

		rerender(<Gallery items={[createMedia(1, "A")]} />);

		act(() => {
			jest.advanceTimersByTime(700);
		});

		const wrapper = screen.getByTestId("gallery-image").closest(".flex-none");
		expect(wrapper).toBeDefined();
	});
});
