import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const size = {
	width: 512,
	height: 512,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
	const iconUrl = process.env.NEXT_PUBLIC_ICON_URL ?? "";
	const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Site";

	return new ImageResponse(
		// biome-ignore lint/performance/noImgElement: ImageResponse in next/og renders static image markup, not DOM img optimization targets.
		<img
			src={iconUrl}
			alt={siteName}
			style={{
				width: "100%",
				height: "100%",
			}}
		/>,
		{
			...size,
		},
	);
}
