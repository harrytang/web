import { render, screen } from "@testing-library/react";
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

const photos = (count: number): Media[] =>
	Array.from({ length: count }, (_, i) => createMedia(i + 1, `Photo ${i + 1}`));

// The gallery root holds one child per column; count the images in each.
const columnSizes = (container: HTMLElement): number[] =>
	Array.from(container.firstElementChild?.children ?? []).map(
		(column) => column.querySelectorAll('[data-testid="gallery-image"]').length,
	);

describe("Gallery", () => {
	it("renders nothing when there are no photos", () => {
		const { container } = render(<Gallery items={[]} />);

		expect(container).toBeEmptyDOMElement();
	});

	it("renders every photo with its caption, source and size", () => {
		render(<Gallery items={photos(5)} />);

		const images = screen.getAllByTestId("gallery-image");
		expect(images).toHaveLength(5);
		images.forEach((image, i) => {
			expect(image).toHaveAttribute("data-alt", `Photo ${i + 1}`);
			expect(image).toHaveAttribute(
				"data-src",
				`https://example.com/${i + 1}.jpg`,
			);
			expect(image).toHaveAttribute("data-width", "1200");
			expect(image).toHaveAttribute("data-height", "800");
		});
	});

	it("keeps the photos in their original order across the columns", () => {
		render(<Gallery items={photos(5)} />);

		const alts = screen
			.getAllByTestId("gallery-image")
			.map((image) => image.getAttribute("data-alt"));
		expect(alts).toEqual([
			"Photo 1",
			"Photo 2",
			"Photo 3",
			"Photo 4",
			"Photo 5",
		]);
	});

	it.each([
		[5, [1, 2, 2]],
		[3, [1, 1, 1]],
		[4, [1, 2, 1]],
		[6, [2, 2, 2]],
		[2, [1, 1]],
		[1, [1]],
	])("splits %i photos across the columns as %j", (count, expected) => {
		const { container } = render(<Gallery items={photos(count)} />);

		expect(columnSizes(container)).toEqual(expected);
	});

	it("marks only the middle photo as high priority", () => {
		render(<Gallery items={photos(5)} />);

		const priorities = screen
			.getAllByTestId("gallery-image")
			.map((image) => image.getAttribute("data-priority"));
		expect(priorities).toEqual(["false", "false", "true", "false", "false"]);
	});

	it("is static: no slideshow control and nothing is hidden", () => {
		render(<Gallery items={photos(5)} />);

		expect(screen.queryByRole("button")).not.toBeInTheDocument();
		expect(screen.queryByText(/slideshow/i)).not.toBeInTheDocument();
	});
});
