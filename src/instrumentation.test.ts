import { purgeCFCache } from "@/lib/cloudflare";
import { register } from "./instrumentation";

jest.mock("@/lib/cloudflare", () => ({
	purgeCFCache: jest.fn(),
}));

describe("instrumentation", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		jest.clearAllMocks();
		process.env = { ...originalEnv };
		delete (globalThis as any).__cfPurgedOnStartup;
	});

	afterEach(() => {
		process.env = originalEnv;
		delete (globalThis as any).__cfPurgedOnStartup;
	});

	it("returns early when PURGE_CF_ON_STARTUP is not set", async () => {
		delete process.env.PURGE_CF_ON_STARTUP;

		await register();

		expect(purgeCFCache).not.toHaveBeenCalled();
	});

	it("returns early when PURGE_CF_ON_STARTUP is not 'true'", async () => {
		process.env.PURGE_CF_ON_STARTUP = "false";

		await register();

		expect(purgeCFCache).not.toHaveBeenCalled();
	});

	it("returns early if already purged on startup", async () => {
		process.env.PURGE_CF_ON_STARTUP = "true";
		(globalThis as any).__cfPurgedOnStartup = true;

		await register();

		expect(purgeCFCache).not.toHaveBeenCalled();
	});

	it("calls purgeCFCache when PURGE_CF_ON_STARTUP is true and not yet purged", async () => {
		process.env.PURGE_CF_ON_STARTUP = "true";
		(purgeCFCache as jest.Mock).mockResolvedValueOnce(true);

		await register();

		expect(purgeCFCache).toHaveBeenCalledTimes(1);
		expect((globalThis as any).__cfPurgedOnStartup).toBe(true);
	});

	it("sets startup flag to prevent duplicate purges", async () => {
		process.env.PURGE_CF_ON_STARTUP = "true";
		(purgeCFCache as jest.Mock).mockResolvedValueOnce(true);

		await register();
		expect((globalThis as any).__cfPurgedOnStartup).toBe(true);

		jest.clearAllMocks();
		await register();

		expect(purgeCFCache).not.toHaveBeenCalled();
	});
});
