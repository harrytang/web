import { splitHeadline } from "./headline";

describe("splitHeadline", () => {
	it("separates the role after the ampersand so it can be emphasised", () => {
		expect(splitHeadline("Solutions Architect & DevOps Specialist")).toEqual([
			"Solutions Architect & ",
			"DevOps Specialist",
		]);
	});

	it("keeps the whole title together when there is no ampersand", () => {
		expect(splitHeadline("Software Builder")).toEqual(["Software Builder", ""]);
	});

	it("emphasises only the last part when there are several ampersands", () => {
		expect(splitHeadline("Design & Build & Run")).toEqual([
			"Design & Build & ",
			"Run",
		]);
	});

	it("does not split on a trailing ampersand with nothing after it", () => {
		expect(splitHeadline("Solutions &")).toEqual(["Solutions &", ""]);
	});

	it("does not split an ampersand inside a word", () => {
		expect(splitHeadline("R&D Lead")).toEqual(["R&D Lead", ""]);
	});

	it("handles an empty title", () => {
		expect(splitHeadline("")).toEqual(["", ""]);
	});

	it("never changes the text: the two parts always rejoin to the original", () => {
		for (const title of [
			"Solutions Architect & DevOps Specialist",
			"Software Builder",
			"Design & Build & Run",
			"Solutions &",
			"",
		]) {
			expect(splitHeadline(title).join("")).toBe(title);
		}
	});
});
