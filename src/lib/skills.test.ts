import { listRandomSkill } from "./skills";
import { fetchAPI } from "./strapi";

jest.mock("./strapi", () => ({
	fetchAPI: jest.fn(),
}));

const mockedFetchAPI = jest.mocked(fetchAPI);

describe("skills", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("listRandomSkill fetches skills with image populate", async () => {
		mockedFetchAPI.mockResolvedValue({
			data: [{ id: 1 }, { id: 2 }],
			meta: { pagination: { start: 0, limit: 2, total: 2 } },
		} as never);

		const randomSpy = jest.spyOn(Math, "random").mockReturnValue(0.9);
		const result = await listRandomSkill();

		expect(mockedFetchAPI).toHaveBeenCalledWith("/skills", {
			populate: ["image"],
		});
		expect(result).toEqual([{ id: 1 }, { id: 2 }]);

		randomSpy.mockRestore();
	});
});
