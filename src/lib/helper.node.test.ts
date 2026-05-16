/** @jest-environment node */

import { getStrapiURL } from "./helper";

describe("getStrapiURL", () => {
	const originalStrapiApiUrl = process.env.STRAPI_API_URL;
	const originalPublicStrapiApiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;

	afterEach(() => {
		process.env.STRAPI_API_URL = originalStrapiApiUrl;
		process.env.NEXT_PUBLIC_STRAPI_API_URL = originalPublicStrapiApiUrl;
	});

	it("returns the server-side URL when window is undefined", () => {
		process.env.STRAPI_API_URL = "http://localhost:1337";
		delete process.env.NEXT_PUBLIC_STRAPI_API_URL;

		expect(getStrapiURL("/path")).toBe("http://localhost:1337/path");
	});
});
