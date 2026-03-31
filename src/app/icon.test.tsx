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
	beforeEach(() => {
		jest.clearAllMocks();
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
});
