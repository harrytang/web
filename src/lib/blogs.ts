import type { Seo } from "@/types/seo";
import { fetchAPI, getAllEntitySlugs } from "./strapi";

export interface Blog {
	id: number;
	documentId: string;
	title: string;
	slug: string;
	content: string;
	mediaUrl?: string;
	locale: string;
	seo: Seo;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
}

// Posts exist in several locales; locale=* makes Strapi search, sort and paginate across all of them
const getBlog = async (slug: string) => {
	const res = await fetchAPI<Blog[]>(
		"/blogs",
		{
			populate: [
				"seo",
				"seo.metaImage",
				"seo.metaSocial",
				"seo.metaSocial.image",
			],
			filters: {
				slug: slug,
			},
			locale: "*",
		},
		{
			next: { tags: [`blog-${slug}`] },
		},
	);
	return res.data[0];
};

const getBlogs = async (
	start = 0,
	limit = parseInt(process.env.NEXT_PUBLIC_PAGE_SIZE ?? "10", 10),
) => {
	return await fetchAPI<Blog[]>("/blogs", {
		populate: ["seo", "seo.metaImage"],
		sort: "publishedAt:desc",
		locale: "*",
		pagination: { start, limit },
	});
};

const getBlogSlugs = async () => {
	return getAllEntitySlugs("blogs");
};

export { getBlog, getBlogSlugs, getBlogs };
