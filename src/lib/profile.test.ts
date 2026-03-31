import { getProfile } from "./profile";
import { fetchAPI } from "./strapi";

jest.mock("./strapi", () => ({
	fetchAPI: jest.fn(),
}));

const mockedFetchAPI = jest.mocked(fetchAPI);

describe("profile", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("getProfile fetches profile with required populate fields", async () => {
		mockedFetchAPI.mockResolvedValue({
			data: { id: 1 },
			meta: { pagination: { start: 0, limit: 1, total: 1 } },
		} as never);

		await getProfile();

		expect(mockedFetchAPI).toHaveBeenCalledWith("/profile", {
			populate: [
				"photos",
				"seo",
				"seo.metaImage",
				"seo.metaSocial",
				"seo.metaSocial.image",
				"socials",
				"socials.icon",
				"portraitPhoto",
			],
		});
	});
});
