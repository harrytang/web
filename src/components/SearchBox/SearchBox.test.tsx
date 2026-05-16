import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter, useSearchParams } from "next/navigation";
import SearchBox from "./SearchBox";

jest.mock("next/navigation", () => ({
	useSearchParams: jest.fn().mockReturnValue(new URLSearchParams("")),
	useRouter: jest.fn(),
}));

describe("SearchBox", () => {
	const push = jest.fn();

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue({ push });
		(useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams(""));
		push.mockClear();
	});

	it("renders the search input with the default value", () => {
		render(<SearchBox />);
		const inputElement = screen.getByPlaceholderText("Search Articles");
		expect(inputElement).toBeInTheDocument();
		expect(inputElement).toHaveValue("");
	});

	it("submits the form and navigates to the search results page", async () => {
		render(<SearchBox />);
		const inputElement = screen.getByPlaceholderText("Search Articles");
		await userEvent.type(inputElement, "test search{enter}");
		expect(push).toHaveBeenCalledWith("/search?q=test search");
	});

	it("displays the correct default value from search params", () => {
		(useSearchParams as jest.Mock).mockReturnValue(
			new URLSearchParams("q=default search"),
		);
		render(<SearchBox />);
		const inputElement = screen.getByPlaceholderText("Search Articles");
		expect(inputElement).toHaveValue("default search");
	});

	it("prevents form submission with an empty input", async () => {
		render(<SearchBox />);
		const inputElement = screen.getByPlaceholderText("Search Articles");
		await userEvent.type(inputElement, "{enter}");
		expect(push).not.toHaveBeenCalled();
	});
});
