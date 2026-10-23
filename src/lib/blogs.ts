import type { Seo } from "@/types/seo";
import {
	fetchAPI,
	fetchEntries,
	getAllEntitySlugs,
	getLocales,
} from "./strapi";

export interface Blog {
	id: number;
	attributes: {
		title: string;
		slug: string;
		content: string;
		mediaUrl?: string;
		locale: string;
		seo: Seo;
		createdAt: string;
		updatedAt: string;
		publishedAt: string;
	};
}

const getBlog = async (slug: string) => {
	const locales = await getLocales();
	const results = await Promise.all(
		locales.map((locale) =>
			fetchAPI<Blog[]>(
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
					locale,
				},
				{
					next: { tags: [`blog-${slug}`] },
				},
			),
		),
	);
	return results.flatMap((res) => res.data)[0];
};

const getBlogs = async (
	start = 0,
	limit = parseInt(process.env.NEXT_PUBLIC_PAGE_SIZE ?? "10", 10),
) => {
	// the newest start + limit posts of each locale are enough to fill this page of the merged list
	const count = start + limit;
	const locales = await getLocales();
	const results = await Promise.all(
		locales.map((locale) =>
			fetchEntries<Blog>(
				"/blogs",
				{
					populate: ["seo", "seo.metaImage"],
					sort: "publishedAt:desc",
					locale,
				},
				{ pageSize: count, count },
			),
		),
	);

	const data = results
		.flatMap((res) => res.entries)
		.sort(
			(a, b) =>
				Date.parse(b.attributes.publishedAt) -
				Date.parse(a.attributes.publishedAt),
		)
		.slice(start, count);
	const total = results.reduce((sum, res) => sum + res.total, 0);

	return { data, meta: { pagination: { start, limit, total } } };
};

const getBlogSlugs = async () => {
	return getAllEntitySlugs("blogs");
};

export { getBlog, getBlogSlugs, getBlogs };
