import qs from "qs";
import { getStrapiURL } from "./helper";

type StrapiResponse<T> = {
	data: T;
	meta: {
		pagination: {
			start: number;
			limit: number;
			total: number;
		};
	};
};

const request = async <T>(
	path: string,
	urlParamsObject: object = {},
	options: object = {},
): Promise<T> => {
	// Merge default and user options
	const cache = (
		process.env.NODE_ENV === "development" ? "no-store" : "force-cache"
	) as RequestCache;
	const mergedOptions = {
		headers: {
			"Content-Type": "application/json",
		},
		cache,
		...options,
	};

	// Build request URL
	const queryString = qs.stringify(urlParamsObject);
	const requestUrl = `${getStrapiURL(`/api${path}${queryString ? `?${queryString}` : ""}`)}`;

	// Trigger API call
	const response = await fetch(requestUrl, mergedOptions);

	// Handle response
	if (!response.ok) {
		console.error(response.statusText);
		throw new Error(`An error occured please try again`);
	}
	return response.json();
};

const fetchAPI = async <T>(
	path: string,
	urlParamsObject: object = {},
	options: object = {},
): Promise<StrapiResponse<T>> => {
	const res = await request<StrapiResponse<T>>(path, urlParamsObject, options);
	return {
		data: res.data,
		meta: res.meta,
	};
};

// Strapi 5 has no locale=all, so queries across locales run once per locale
const getLocales = async () => {
	const locales = await request<{ code: string }[]>("/i18n/locales");
	return locales.map((locale) => locale.code);
};

// Fetch up to `count` entries in pages of `pageSize`. Strapi caps each page at
// api.rest.maxLimit, so advance by the rows received, not the rows asked for.
const fetchEntries = async <T>(
	path: string,
	urlParamsObject: object,
	{
		pageSize,
		count = Number.POSITIVE_INFINITY,
	}: { pageSize: number; count?: number },
	options: object = {},
) => {
	const entries: T[] = [];
	let total = 0;
	let hasMore = true;

	while (hasMore) {
		const res = await fetchAPI<T[]>(
			path,
			{
				...urlParamsObject,
				pagination: {
					limit: Math.min(pageSize, count - entries.length),
					start: entries.length,
				},
			},
			options,
		);
		entries.push(...res.data);
		total = res.meta.pagination.total;
		hasMore = res.data.length > 0 && entries.length < Math.min(count, total);
	}

	return { entries, total };
};

const getAllEntitySlugs = async (entity: string) => {
	type SlugEntity = {
		slug: string;
	};

	const pageSize = process.env.SITEMAP_SIZE
		? parseInt(process.env.SITEMAP_SIZE, 10)
		: 1000;
	const locales = await getLocales();
	const results = await Promise.all(
		locales.map((locale) =>
			fetchEntries<SlugEntity>(`/${entity}`, { locale }, { pageSize }),
		),
	);

	return results.flatMap((res) => res.entries.map((item) => item.slug));
};

export { fetchAPI, fetchEntries, getAllEntitySlugs, getLocales };
