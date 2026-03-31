import robots from "./robots";

describe("robots route", () => {
	it("returns expected robots metadata with sitemap URL", () => {
		expect(robots()).toEqual({
			rules: {
				userAgent: "*",
				allow: "/",
				disallow: "/api/",
			},
			sitemap: `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
		});
	});
});
