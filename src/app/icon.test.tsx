import { ImageResponse } from "next/og";
import Icon, { contentType, runtime, size } from "./icon";

jest.mock("next/og", () => ({
	ImageResponse: jest
		.fn()
		.mockImplementation(function MockImageResponse(element, init) {
			return { element, init };
		}),
}));

describe("icon route", () => {
	const originalIconUrl = process.env.NEXT_PUBLIC_ICON_URL;
	const originalSiteName = process.env.NEXT_PUBLIC_SITE_NAME;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	afterEach(() => {
		process.env.NEXT_PUBLIC_ICON_URL = originalIconUrl;
		process.env.NEXT_PUBLIC_SITE_NAME = originalSiteName;
	});

	it("exports the expected static metadata", () => {
		expect(runtime).toBe("edge");
		expect(size).toEqual({ width: 512, height: 512 });
		expect(contentType).toBe("image/png");
	});

	it("creates an ImageResponse with env-driven image element", () => {
		const result = Icon();

		expect(ImageResponse).toHaveBeenCalledTimes(1);
		const [element, init] = (ImageResponse as unknown as jest.Mock).mock
			.calls[0];
		expect(init).toEqual({ width: 512, height: 512 });
		expect(element.props.src).toBe(process.env.NEXT_PUBLIC_ICON_URL);
		expect(element.props.alt).toBe(process.env.NEXT_PUBLIC_SITE_NAME);
		expect(element.props.style).toEqual({ width: "100%", height: "100%" });
		expect(result).toEqual({ element, init });
	});

	it("falls back to empty src and default site name when env vars are missing", () => {
		delete process.env.NEXT_PUBLIC_ICON_URL;
		delete process.env.NEXT_PUBLIC_SITE_NAME;

		Icon();

		const [element] = (ImageResponse as unknown as jest.Mock).mock.calls[0];
		expect(element.props.src).toBe("");
		expect(element.props.alt).toBe("Site");
	});
});
