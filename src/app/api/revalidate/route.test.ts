import { algoliasearch } from "algoliasearch";
import { revalidatePath, revalidateTag } from "next/cache";
import { POST } from "./route";

type MockRequest = {
	headers: {
		get: (key: string) => string | null;
	};
	json: () => Promise<unknown>;
};

type RevalidateRequest = Parameters<typeof POST>[0];

jest.mock("next/cache", () => ({
	revalidatePath: jest.fn(),
	revalidateTag: jest.fn(),
}));

jest.mock("algoliasearch", () => ({
	algoliasearch: jest.fn(),
}));

describe("api revalidate route", () => {
	const saveObject = jest.fn();
	const fetchMock = jest.fn();
	const responseJson = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();

		process.env.REVALIDATE_TOKEN = "secret-token";
		process.env.CF_ZONE_ID = "zone-id";
		process.env.CF_API_TOKEN = "cf-token";
		process.env.NEXT_PUBLIC_ALGOLIA_APP_ID = "algolia-app";
		process.env.ALGOLIA_API_KEY = "algolia-admin";
		process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME = "articles_index";

		(global as typeof globalThis & { fetch: typeof fetch }).fetch =
			fetchMock as unknown as typeof fetch;
		fetchMock.mockResolvedValue({ ok: true });

		responseJson.mockImplementation(
			(body: unknown, init?: { status?: number }) => ({
				status: init?.status ?? 200,
				json: async () => body,
			}),
		);
		Object.defineProperty(globalThis, "Response", {
			value: { json: responseJson },
			writable: true,
			configurable: true,
		});

		saveObject.mockResolvedValue({ taskID: 1 });
		(algoliasearch as jest.Mock).mockReturnValue({ saveObject });

		jest.spyOn(console, "info").mockImplementation(() => {});
		jest.spyOn(console, "warn").mockImplementation(() => {});
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	const makeReq = (authorization: string | null, body: unknown) =>
		({
			headers: {
				get: (key: string) =>
					key.toLowerCase() === "authorization" ? authorization : null,
			},
			json: jest.fn().mockResolvedValue(body),
		}) as MockRequest as RevalidateRequest;

	it("returns 401 when token is missing", async () => {
		const req = makeReq(null, {});
		const res = await POST(req);
		const json = await res.json();

		expect(res.status).toBe(401);
		expect(json).toEqual({
			message: "Unauthorized: Missing or invalid Bearer token",
		});
		expect(revalidatePath).not.toHaveBeenCalled();
		expect(revalidateTag).not.toHaveBeenCalled();
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("returns 401 when token is invalid", async () => {
		const req = makeReq("Bearer wrong-token", {});
		const res = await POST(req);

		expect(res.status).toBe(401);
		expect(console.warn).toHaveBeenCalledWith(
			"Unauthorized revalidation attempt.",
		);
	});

	it("does nothing for unsupported event type", async () => {
		const req = makeReq("Bearer secret-token", {
			event: "media.create",
			model: "blog",
			entry: { slug: "my-post" },
		});
		const res = await POST(req);
		const json = await res.json();

		expect(json).toEqual({
			message: "On-Demand Revalidation complete. Cloudflare Cache purged.",
		});
		expect(revalidatePath).not.toHaveBeenCalled();
		expect(revalidateTag).not.toHaveBeenCalled();
		expect(algoliasearch).not.toHaveBeenCalled();
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("revalidates static profile paths and skips algolia push", async () => {
		const req = makeReq("Bearer secret-token", {
			event: "entry.update",
			model: "profile",
			entry: {
				slug: "harry-profile",
				publishedAt: "2026-01-01T00:00:00.000Z",
			},
		});

		await POST(req);

		expect(revalidateTag).not.toHaveBeenCalled();
		expect(revalidatePath).toHaveBeenCalledTimes(2);
		expect(revalidatePath).toHaveBeenCalledWith("/about", "page");
		expect(revalidatePath).toHaveBeenCalledWith("/", "page");
		expect(algoliasearch).not.toHaveBeenCalled();
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it("revalidates blog paths, pushes algolia object, and purges cloudflare", async () => {
		const req = makeReq("Bearer secret-token", {
			event: "entry.create",
			model: "blog",
			entry: {
				slug: "my-post",
				title: "My Post",
				seo: {
					metaDescription: "Desc",
					keywords: ["next", "jest"],
					metaImage: {
						caption: "Cover",
						formats: { thumbnail: { url: "https://cdn/image.jpg" } },
					},
				},
				publishedAt: "2026-01-01T00:00:00.000Z",
				createdAt: "2026-01-01T00:00:00.000Z",
				updatedAt: "2026-01-02T00:00:00.000Z",
			},
		});

		await POST(req);

		expect(revalidateTag).toHaveBeenCalledWith("blog-my-post", "max");
		expect(revalidatePath).toHaveBeenCalledWith("/articles/[current]", "page");
		expect(revalidatePath).toHaveBeenCalledWith("/", "page");

		expect(algoliasearch).toHaveBeenCalledWith("algolia-app", "algolia-admin");
		expect(saveObject).toHaveBeenCalledWith({
			indexName: "articles_index",
			body: {
				objectID: "my-post",
				title: "My Post",
				description: "Desc",
				image: { url: "https://cdn/image.jpg", alt: "Cover" },
				keywords: ["next", "jest"],
				publishedAt: "2026-01-01T00:00:00.000Z",
				createdAt: "2026-01-01T00:00:00.000Z",
				updatedAt: "2026-01-02T00:00:00.000Z",
			},
		});

		expect(fetchMock).toHaveBeenCalledWith(
			"https://api.cloudflare.com/client/v4/zones/zone-id/purge_cache",
			expect.objectContaining({
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer cf-token",
				},
				body: JSON.stringify({ purge_everything: true }),
			}),
		);
	});

	it("uses algolia fallback values when env vars are missing", async () => {
		delete process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
		delete process.env.ALGOLIA_API_KEY;
		delete process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME;

		const req = makeReq("Bearer secret-token", {
			event: "entry.update",
			model: "blog",
			entry: {
				slug: "fallback-post",
				title: "Fallback Post",
				seo: {
					metaDescription: "Fallback desc",
					keywords: [],
					metaImage: {
						caption: "Fallback cover",
						formats: { thumbnail: { url: "https://cdn/fallback.jpg" } },
					},
				},
				publishedAt: "2026-01-01T00:00:00.000Z",
				createdAt: "2026-01-01T00:00:00.000Z",
				updatedAt: "2026-01-02T00:00:00.000Z",
			},
		});

		await POST(req);

		expect(algoliasearch).toHaveBeenCalledWith("", "");
		expect(saveObject).toHaveBeenCalledWith(
			expect.objectContaining({ indexName: "articles_index" }),
		);
	});

	it("skips algolia push when blog payload is incomplete", async () => {
		const req = makeReq("Bearer secret-token", {
			event: "entry.update",
			model: "blog",
			entry: {
				slug: "incomplete",
				seo: {
					metaDescription: "present but missing title",
				},
				publishedAt: "2026-01-01T00:00:00.000Z",
			},
		});

		await POST(req);

		expect(console.warn).toHaveBeenCalledWith(
			"Skipping Algolia push due to incomplete blog payload",
		);
		expect(algoliasearch).not.toHaveBeenCalled();
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it("defaults algolia keywords to empty array when missing", async () => {
		const req = makeReq("Bearer secret-token", {
			event: "entry.create",
			model: "blog",
			entry: {
				slug: "no-keywords",
				title: "No Keywords",
				seo: {
					metaDescription: "Desc",
					metaImage: {
						caption: "Cover",
						formats: { thumbnail: { url: "https://cdn/image.jpg" } },
					},
				},
				publishedAt: "2026-01-01T00:00:00.000Z",
				createdAt: "2026-01-01T00:00:00.000Z",
				updatedAt: "2026-01-02T00:00:00.000Z",
			},
		});

		await POST(req);

		expect(saveObject).toHaveBeenCalledWith(
			expect.objectContaining({
				body: expect.objectContaining({
					keywords: [],
				}),
			}),
		);
	});

	describe("draft & publish events", () => {
		const blogEntry = (publishedAt: string | null) => ({
			slug: "my-post",
			title: "My Post",
			seo: {
				metaDescription: "Desc",
				metaImage: {
					caption: "Cover",
					formats: { thumbnail: { url: "https://cdn/image.jpg" } },
				},
			},
			publishedAt,
			createdAt: "2026-01-01T00:00:00.000Z",
			updatedAt: "2026-01-02T00:00:00.000Z",
		});

		it("ignores draft saves, which Strapi 5 sends as entry.update with publishedAt null", async () => {
			const req = makeReq("Bearer secret-token", {
				event: "entry.update",
				model: "blog",
				entry: blogEntry(null),
			});

			await POST(req);

			expect(revalidateTag).not.toHaveBeenCalled();
			expect(revalidatePath).not.toHaveBeenCalled();
			expect(algoliasearch).not.toHaveBeenCalled();
			expect(fetchMock).not.toHaveBeenCalled();
		});

		it("revalidates, pushes to algolia and purges cloudflare on entry.publish", async () => {
			const req = makeReq("Bearer secret-token", {
				event: "entry.publish",
				model: "blog",
				entry: blogEntry("2026-01-03T00:00:00.000Z"),
			});

			await POST(req);

			expect(revalidateTag).toHaveBeenCalledWith("blog-my-post", "max");
			expect(revalidatePath).toHaveBeenCalledWith(
				"/articles/[current]",
				"page",
			);
			expect(saveObject).toHaveBeenCalledWith(
				expect.objectContaining({
					body: expect.objectContaining({
						objectID: "my-post",
						publishedAt: "2026-01-03T00:00:00.000Z",
					}),
				}),
			);
			expect(fetchMock).toHaveBeenCalledTimes(1);
		});

		it.each(["entry.unpublish", "entry.delete"])(
			"revalidates and purges cloudflare without pushing to algolia on %s",
			async (event) => {
				const req = makeReq("Bearer secret-token", {
					event,
					model: "blog",
					entry: blogEntry(null),
				});

				await POST(req);

				expect(revalidateTag).toHaveBeenCalledWith("blog-my-post", "max");
				expect(revalidatePath).toHaveBeenCalledWith("/", "page");
				expect(algoliasearch).not.toHaveBeenCalled();
				expect(fetchMock).toHaveBeenCalledTimes(1);
			},
		);

		// Strapi 5 re-reads the entry after commit; through a lagging Galera replica the
		// read can miss the new published row, so the payload carries entry: null
		it("still revalidates static paths when entry.publish arrives with entry null", async () => {
			const req = makeReq("Bearer secret-token", {
				event: "entry.publish",
				model: "profile",
				entry: null,
			});

			const res = await POST(req);

			expect(res.status).toBe(200);
			expect(revalidatePath).toHaveBeenCalledWith("/about", "page");
			expect(revalidatePath).toHaveBeenCalledWith("/", "page");
			expect(fetchMock).toHaveBeenCalledTimes(1);
			expect(console.warn).toHaveBeenCalledWith(
				"Webhook entry.publish for profile has no entry; revalidating static paths only",
			);
		});

		it("revalidates blog list pages but skips the tag and algolia when entry.publish has entry null", async () => {
			const req = makeReq("Bearer secret-token", {
				event: "entry.publish",
				model: "blog",
				entry: null,
			});

			await POST(req);

			expect(revalidateTag).not.toHaveBeenCalled();
			expect(revalidatePath).toHaveBeenCalledWith("/articles/[current]", "page");
			expect(algoliasearch).not.toHaveBeenCalled();
			expect(fetchMock).toHaveBeenCalledTimes(1);
		});

		it("ignores entry.update with entry null instead of crashing", async () => {
			const req = makeReq("Bearer secret-token", {
				event: "entry.update",
				model: "blog",
				entry: null,
			});

			const res = await POST(req);

			expect(res.status).toBe(200);
			expect(revalidatePath).not.toHaveBeenCalled();
			expect(fetchMock).not.toHaveBeenCalled();
		});
	});
});
