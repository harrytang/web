export const purgeCFCache = async (): Promise<boolean> => {
	const zoneId = process.env.CF_ZONE_ID;
	const apiToken = process.env.CF_API_TOKEN;

	if (!zoneId || !apiToken) {
		console.warn("Skipping Cloudflare cache purge: CF_ZONE_ID or CF_API_TOKEN is missing");
		return false;
	}

	console.info("Purging Cloudflare Cache");
	const response = await fetch(
		`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiToken}`,
			},
			body: JSON.stringify({ purge_everything: true }),
		},
	);

	if (!response.ok) {
		const body = await response.text();
		console.error(`Cloudflare cache purge failed: ${response.status} ${body}`);
		return false;
	}

	return true;
};
