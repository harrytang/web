import { usePrevious } from "./index";

describe("hooks barrel", () => {
	it("exports usePrevious", () => {
		expect(usePrevious).toBeDefined();
	});
});
