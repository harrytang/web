import { getProjects } from "./projects";
import { fetchAPI } from "./strapi";

jest.mock("./strapi", () => ({
	fetchAPI: jest.fn(),
}));

const mockedFetchAPI = jest.mocked(fetchAPI);

describe("projects", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("getProjects fetches projects with populate and sort", async () => {
		mockedFetchAPI.mockResolvedValue({
			data: [],
			meta: { pagination: { start: 0, limit: 0, total: 0 } },
		} as never);

		await getProjects();

		expect(mockedFetchAPI).toHaveBeenCalledWith("/projects", {
			populate: ["icon", "link"],
			sort: "publishedAt:desc",
		});
	});
});
