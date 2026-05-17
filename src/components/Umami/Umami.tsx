"use client";

import Script from "next/script";

const Umami = () => {
	const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
	const scriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;

	if (!websiteId || !scriptUrl) {
		return null;
	}

	return (
		<Script
			id="umami-analytics"
			src={scriptUrl}
			data-website-id={websiteId}
			strategy="afterInteractive"
		/>
	);
};

export default Umami;
