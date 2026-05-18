import { purgeCFCache } from "@/lib/cloudflare";

const globalForStartup = globalThis as typeof globalThis & {
	__cfPurgedOnStartup?: boolean;
};

export async function register() {
	if (process.env.PURGE_CF_ON_STARTUP !== "true") {
		return;
	}

	if (globalForStartup.__cfPurgedOnStartup) {
		return;
	}

	globalForStartup.__cfPurgedOnStartup = true;
	await purgeCFCache();
}
