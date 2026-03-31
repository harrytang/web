import { getPage, getPageSlugs } from "./pages";
import { fetchAPI, getAllEntitySlugs } from "./strapi";

jest.mock("./strapi", () => ({
	fetchAPI: jest.fn(),
	getAllEntitySlugs: jest.fn(),
}));

const mockedFetchAPI = jest.mocked(fetchAPI);
const mockedGetAllEntitySlugs = jest.mocked(getAllEntitySlugs);

describe("pages", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("getPage requests page by slug and returns first entry", async () => {
		mockedFetchAPI.mockResolvedValue({
			data: [{ id: 1, attributes: { slug: "about" } }],
			meta: { pagination: { start: 0, limit: 1, total: 1 } },
		} as never);

		const result = await getPage("about");

		expect(mockedFetchAPI).toHaveBeenCalledWith(
			"/pages",
			expect.objectContaining({ filters: { slug: "about" } }),
			{ next: { tags: ["page-about"] } },
		);
		expect(result).toEqual({ id: 1, attributes: { slug: "about" } });
	});

	it("getPageSlugs delegates to getAllEntitySlugs", async () => {
		mockedGetAllEntitySlugs.mockResolvedValue(["about", "projects"]);

		const result = await getPageSlugs();

		expect(mockedGetAllEntitySlugs).toHaveBeenCalledWith("pages");
		expect(result).toEqual(["about", "projects"]);
	});
});
