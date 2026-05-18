import { purgeCFCache } from "./cloudflare";

describe("purgeCFCache", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		jest.clearAllMocks();
		process.env = { ...originalEnv };
		jest.spyOn(console, "info").mockImplementation(() => {});
		jest.spyOn(console, "warn").mockImplementation(() => {});
		jest.spyOn(console, "error").mockImplementation(() => {});
		global.fetch = jest.fn();
	});

	afterEach(() => {
		jest.restoreAllMocks();
		process.env = originalEnv;
	});

	it("returns true on successful cache purge", async () => {
		process.env.CF_ZONE_ID = "zone-123";
		process.env.CF_API_TOKEN = "token-xyz";

		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: true,
			text: jest.fn().mockResolvedValueOnce(""),
		});

		const result = await purgeCFCache();

		expect(result).toBe(true);
		expect(console.info).toHaveBeenCalledWith("Purging Cloudflare Cache");
		expect(global.fetch).toHaveBeenCalledWith(
			"https://api.cloudflare.com/client/v4/zones/zone-123/purge_cache",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: "Bearer token-xyz",
				},
				body: JSON.stringify({ purge_everything: true }),
			},
		);
	});

	it("returns false when CF_ZONE_ID is missing", async () => {
		delete process.env.CF_ZONE_ID;
		process.env.CF_API_TOKEN = "token-xyz";

		const result = await purgeCFCache();

		expect(result).toBe(false);
		expect(console.warn).toHaveBeenCalledWith(
			"Skipping Cloudflare cache purge: CF_ZONE_ID or CF_API_TOKEN is missing",
		);
		expect(global.fetch).not.toHaveBeenCalled();
	});

	it("returns false when CF_API_TOKEN is missing", async () => {
		process.env.CF_ZONE_ID = "zone-123";
		delete process.env.CF_API_TOKEN;

		const result = await purgeCFCache();

		expect(result).toBe(false);
		expect(console.warn).toHaveBeenCalledWith(
			"Skipping Cloudflare cache purge: CF_ZONE_ID or CF_API_TOKEN is missing",
		);
		expect(global.fetch).not.toHaveBeenCalled();
	});

	it("returns false when cache purge request fails", async () => {
		process.env.CF_ZONE_ID = "zone-123";
		process.env.CF_API_TOKEN = "token-xyz";

		(global.fetch as jest.Mock).mockResolvedValueOnce({
			ok: false,
			status: 401,
			text: jest.fn().mockResolvedValueOnce("Unauthorized"),
		});

		const result = await purgeCFCache();

		expect(result).toBe(false);
		expect(console.error).toHaveBeenCalledWith(
			"Cloudflare cache purge failed: 401 Unauthorized",
		);
		expect(global.fetch).toHaveBeenCalled();
	});
});
