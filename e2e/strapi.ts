import { type APIRequestContext, request } from "@playwright/test";
import type { Blog } from "@/lib/blogs";

const newStrapiContext = () =>
	request.newContext({ baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL });

// Strapi 5 has no locale=all: merge the newest posts of every locale
const getLatestBlogs = async (reqCtx: APIRequestContext, limit: number) => {
	const localesResponse = await reqCtx.get("/api/i18n/locales");
	const locales = (await localesResponse.json()) as { code: string }[];
	const blogsByLocale = await Promise.all(
		locales.map(async ({ code }) => {
			const blogsResponse = await reqCtx.get(
				`/api/blogs?pagination[limit]=${limit}&sort=publishedAt:desc&locale=${code}`,
			);
			return ((await blogsResponse.json()) as { data: Blog[] }).data;
		}),
	);

	return blogsByLocale
		.flat()
		.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
		.slice(0, limit);
};

export { getLatestBlogs, newStrapiContext };
