import { type APIRequestContext, request } from "@playwright/test";
import type { Blog } from "@/lib/blogs";

const newStrapiContext = () =>
	request.newContext({ baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL });

// newest posts across every locale (locale=*), the order the site lists them in
const getLatestBlogs = async (reqCtx: APIRequestContext, limit: number) => {
	const blogsResponse = await reqCtx.get(
		`/api/blogs?pagination[limit]=${limit}&sort=publishedAt:desc&locale=*`,
	);
	return ((await blogsResponse.json()) as { data: Blog[] }).data;
};

export { getLatestBlogs, newStrapiContext };
