type Webhook = {
	event: string;
	model: string;
	entry: Record<string, unknown> | null;
};

export default Webhook;
