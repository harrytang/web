import { fetchAPI } from "./strapi";
import { getUses } from "./uses";

jest.mock("./strapi", () => ({
	fetchAPI: jest.fn(),
}));

const mockedFetchAPI = jest.mocked(fetchAPI);

describe("uses", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("getUses fetches uses with expected query options", async () => {
		mockedFetchAPI.mockResolvedValue({
			data: [],
			meta: { pagination: { start: 0, limit: 0, total: 0 } },
		} as never);

		await getUses();

		expect(mockedFetchAPI).toHaveBeenCalledWith("/uses", {
			populate: [],
			sort: "publishedAt:desc",
		});
	});
});
