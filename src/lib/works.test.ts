import { fetchAPI } from "./strapi";
import { getWorks } from "./works";

jest.mock("./strapi", () => ({
	fetchAPI: jest.fn(),
}));

const mockedFetchAPI = jest.mocked(fetchAPI);

describe("works", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("getWorks fetches works with expected query options", async () => {
		mockedFetchAPI.mockResolvedValue({
			data: [],
			meta: { pagination: { start: 0, limit: 0, total: 0 } },
		} as never);

		await getWorks();

		expect(mockedFetchAPI).toHaveBeenCalledWith("/works", {
			populate: ["logo"],
			sort: "start:DESC",
		});
	});
});
