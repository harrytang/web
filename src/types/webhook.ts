type Webhook = {
	event: string;
	model: string;
	entry: Record<string, unknown>;
};

export default Webhook;
