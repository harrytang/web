import type { Seo } from "@/types/seo";
import type { Blog } from "./blogs";
import type { Profile } from "./profile";
import type { Use } from "./uses";

const getStrapiURL = (path: string = "") => {
	// Default to the server-side URL
	let url = process.env.STRAPI_API_URL;

	// When on the client-side (in the browser), use the environment variable
	if (typeof window !== "undefined") {
		url = process.env.NEXT_PUBLIC_STRAPI_API_URL;
	}

	return `${url}${path}`;
};
const getPublicSiteURL = () => {
	let publicSiteUrl = "http://localhost:3000";
	if (
		typeof process.env.NEXT_PUBLIC_SITE_URL === "string" &&
		process.env.NEXT_PUBLIC_SITE_URL.length > 0
	) {
		publicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
	}
	return publicSiteUrl;
};

const getSiteName = () => process.env.NEXT_PUBLIC_SITE_NAME ?? "Site";

const generateSeoMeta = (
	path: string,
	seo: Seo,
	type: string,
	locale: string,
) => {
	const publicSiteUrl = getPublicSiteURL();

	// Find the first Facebook and Twitter entries in metaSocial
	const facebookData = seo.metaSocial.find(
		(entry) => entry.socialNetwork === "Facebook",
	);
	const twitterData = seo.metaSocial.find(
		(entry) => entry.socialNetwork === "Twitter",
	);

	return {
		metadataBase: new URL(publicSiteUrl),
		alternates: {
			canonical: seo.canonicalURL ?? `${publicSiteUrl}/${path}`,
		},
		title: seo.metaTitle,
		description: seo.metaDescription,
		keywords: seo.keywords,
		openGraph: {
			title: facebookData?.title || seo.metaTitle,
			description: facebookData?.description || seo.metaDescription,
			siteName: process.env.NEXT_PUBLIC_SITE_NAME,
			images: facebookData
				? [
						{
							url: facebookData.image.url,
							width: facebookData.image.width,
							height: facebookData.image.height,
						},
					]
				: [
						{
							url: seo.metaImage.url,
							width: seo.metaImage.width,
							height: seo.metaImage.height,
						},
					],
			locale: locale,
			type: type,
			url: `${publicSiteUrl}/${path}`,
		},
		twitter: {
			cardType: "summary_large_image",
			title: twitterData?.title || seo.metaTitle,
			description: twitterData?.description || seo.metaDescription,
			images: twitterData ? [twitterData.image.url] : [seo.metaImage.url],
		},
	};
};

const generateWebPageJsonLd = ({
	name,
	description,
}: {
	name: string;
	description: string;
}) => {
	const publicSiteUrl = getPublicSiteURL();

	return {
		"@context": "https://schema.org",
		"@type": "WebPage",
		name,
		description,
		publisher: {
			"@type": "Person",
			name: getSiteName(),
			url: publicSiteUrl,
		},
	};
};

const generatePersonJsonLd = (profile: Profile) => {
	const publicSiteUrl = getPublicSiteURL();
	return {
		"@context": "https://schema.org",
		"@type": "Person",
		name: getSiteName(),
		image: profile.portraitPhoto.url,
		jobTitle: profile.title,
		url: publicSiteUrl,
		sameAs: profile.socials.map((link) => link.href), // other urls
	};
};

const generateArticleJsonLd = (blog: Blog) => {
	const publicSiteUrl = getPublicSiteURL();
	const createdAt = blog.createdAt;
	const publishedAt = blog.publishedAt;
	const modifiedAt = blog.updatedAt;

	return {
		"@context": "https://schema.org",
		"@type": "Article",
		url: `${publicSiteUrl}/blog/${blog.slug}`,
		author: {
			"@type": "Person",
			name: getSiteName(),
			url: publicSiteUrl,
		},
		name: blog.title,
		headline: blog.seo.metaDescription,
		image: {
			"@type": "ImageObject",
			url: blog.seo.metaImage.url,
			width: blog.seo.metaImage.width,
			height: blog.seo.metaImage.height,
		},
		publisher: {
			"@type": "Person",
			name: getSiteName(),
			url: publicSiteUrl,
		},

		datePublished: publishedAt,
		dateModified: modifiedAt,
		dateCreated: createdAt,
	};
};

const generateListArticleJsonLd = (blogs: Blog[]) => {
	const publicSiteUrl = getPublicSiteURL();
	return {
		"@context": "https://schema.org",
		"@type": "ItemList",
		itemListElement: blogs.map((blog, index) => {
			return {
				"@type": "ListItem",
				position: index + 1,
				item: {
					"@type": "Article",
					url: `${publicSiteUrl}/blog/${blog.slug}`,
					headline: blog.title,
					datePublished: blog.publishedAt,
					dateModified: blog.updatedAt,
					dateCreated: blog.createdAt,
					image: {
						"@type": "ImageObject",
						url: blog.seo.metaImage.url,
						width: blog.seo.metaImage.width,
						height: blog.seo.metaImage.height,
					},
					author: {
						"@type": "Person",
						name: getSiteName(),
						url: publicSiteUrl,
					},
					publisher: {
						"@type": "Person",
						name: getSiteName(),
						url: publicSiteUrl,
					},
				},
			};
		}),
	};
};

const generateProfilePageJsonLd = (profile: Profile, hasPart: Blog[] = []) => {
	const publicSiteUrl = getPublicSiteURL();
	const hasPartList = hasPart.map((blog) => {
		return {
			"@type": "Article",
			headline: blog.title,
			url: `${publicSiteUrl}/blog/${blog.slug}`,
			image: {
				"@type": "ImageObject",
				url: blog.seo.metaImage.url,
				width: blog.seo.metaImage.width,
				height: blog.seo.metaImage.height,
			},
			datePublished: blog.publishedAt,
			dateModified: blog.updatedAt,
			dateCreated: blog.createdAt,
			author: { "@id": "#person" },
		};
	});
	const profilePage = {
		"@context": "https://schema.org",
		"@type": "ProfilePage",
		dateCreated: profile.createdAt,
		dateModified: profile.updatedAt,
		mainEntity: {
			"@id": "#person",
			"@type": "Person",
			name: getSiteName(),
			image: profile.portraitPhoto.url,
			jobTitle: profile.title,
			url: publicSiteUrl,
			sameAs: profile.socials.map((link) => link.href), // other urls
		},
	};
	return hasPart.length > 0
		? { ...profilePage, hasPart: hasPartList }
		: profilePage;
};

const clamp = (number: number, a: number, b: number) => {
	const min = Math.min(a, b);
	const max = Math.max(a, b);
	return Math.min(Math.max(number, min), max);
};

const categorizeItems = (items: Use[]) => {
	const categoryMap: { [key: string]: Use[] } = {};

	// Group items by category
	items.forEach((item) => {
		const { category } = item;
		if (!categoryMap[category]) {
			categoryMap[category] = [];
		}
		categoryMap[category].push(item);
	});

	return categoryMap;
};

const formatDate = (dateString: string) => {
	return new Date(dateString).toLocaleDateString("en-GB", {
		day: "numeric",
		month: "long",
		year: "numeric",
		timeZone: "UTC",
	});
};

const isInternalLink = (href: string) =>
	href.startsWith("/") || href.startsWith("#");

export {
	categorizeItems,
	clamp,
	formatDate,
	generateArticleJsonLd,
	generateListArticleJsonLd,
	generatePersonJsonLd,
	generateProfilePageJsonLd,
	generateSeoMeta,
	generateWebPageJsonLd,
	getPublicSiteURL,
	getStrapiURL,
	isInternalLink,
};
