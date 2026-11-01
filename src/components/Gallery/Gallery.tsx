import Image from "next/image";
import { BLUR_IMAGE } from "@/../const";
import type { Media } from "@/types/media";

type GalleryProps = {
	items: Media[];
};

// Each column keeps its own vertical offset so the tiles stagger. On small
// screens the columns share the width; from `sm` up they take a fixed width.
const COLUMN_CLASSES = [
	"ml-auto min-w-0 flex-1 space-y-3 pt-10 sm:ml-0 sm:w-44 sm:flex-none sm:space-y-8 sm:pt-24 lg:order-last lg:w-32 lg:pt-36 xl:order-0 xl:w-40 xl:pt-80",
	"mr-auto min-w-0 flex-1 space-y-3 sm:mr-0 sm:w-44 sm:flex-none sm:space-y-8 lg:w-32 lg:pt-36 xl:w-40",
	"min-w-0 flex-1 space-y-3 pt-16 sm:w-44 sm:flex-none sm:space-y-8 sm:pt-12 lg:w-32 lg:pt-0 xl:w-40",
];

// Split the photos across three columns, giving the remainder to the later
// columns (5 photos become 1 / 2 / 2). Empty columns are dropped.
const splitColumns = (items: Media[]): Media[][] => {
	const base = Math.floor(items.length / 3);
	const remainder = items.length % 3;
	const sizes = [
		base,
		base + (remainder > 0 ? 1 : 0),
		base + (remainder > 1 ? 1 : 0),
	];

	const columns: Media[][] = [];
	let index = 0;
	for (const size of sizes) {
		columns.push(items.slice(index, index + size));
		index += size;
	}
	return columns.filter((column) => column.length > 0);
};

const Gallery: React.FC<GalleryProps> = ({ items }) => {
	if (items.length === 0) {
		return null;
	}

	const middleIdx = Math.floor(items.length / 2);

	return (
		<div className="mt-14 flex gap-3 sm:justify-center sm:gap-8 lg:mt-0 lg:justify-start">
			{splitColumns(items).map((column, columnIndex) => (
				<div key={column[0].id} className={COLUMN_CLASSES[columnIndex]}>
					{column.map((image) => (
						<div key={image.id} className="relative">
							<Image
								src={image.url}
								alt={image.caption}
								sizes="(min-width: 1280px) 10rem, (min-width: 1024px) 8rem, (min-width: 640px) 11rem, 30vw"
								className="aspect-9/10 w-full rounded-2xl bg-surface object-cover shadow-xl shadow-ink/10"
								width={image.width}
								height={image.height}
								priority={
									items.findIndex((item) => item.id === image.id) === middleIdx
								}
								placeholder="blur"
								blurDataURL={BLUR_IMAGE}
							/>
							<div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-ink/10 ring-inset" />
						</div>
					))}
				</div>
			))}
		</div>
	);
};

export default Gallery;
