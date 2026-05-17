import { render, screen } from "@testing-library/react";
import Umami from "./Umami";

jest.mock("next/script", () => ({
	__esModule: true,
	default: (props: Record<string, unknown>) => (
		<script data-testid="umami-script" {...props} />
	),
}));

describe("Umami", () => {
	const originalWebsiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
	const originalScriptUrl = process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;

	afterEach(() => {
		process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID = originalWebsiteId;
		process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL = originalScriptUrl;
	});

	it("renders Umami script when env vars are available", () => {
		process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID = "website-id";
		process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL =
			"https://analytics.example/script.js";

		render(<Umami />);

		expect(screen.getByTestId("umami-script")).toHaveAttribute(
			"src",
			"https://analytics.example/script.js",
		);
		expect(screen.getByTestId("umami-script")).toHaveAttribute(
			"data-website-id",
			"website-id",
		);
	});

	it("renders nothing when required env vars are missing", () => {
		delete process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
		delete process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL;

		const { container } = render(<Umami />);

		expect(container).toBeEmptyDOMElement();
	});
});
