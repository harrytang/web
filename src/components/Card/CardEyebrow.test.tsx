import { render, screen } from "@testing-library/react";
import CardEyebrow from "./CardEyebrow";

describe("CardEyebrow", () => {
	it("renders correctly", () => {
		render(<CardEyebrow decorate>Eyebrow Content</CardEyebrow>);
		const eyebrowElement = screen.getByText("Eyebrow Content");
		expect(eyebrowElement).toBeInTheDocument();
		expect(eyebrowElement).toHaveClass("pl-3.5");
	});

	it("uses muted colors that keep AA contrast in light and dark themes", () => {
		render(<CardEyebrow>Eyebrow Content</CardEyebrow>);
		const eyebrowElement = screen.getByText("Eyebrow Content");

		expect(eyebrowElement).toHaveClass("text-zinc-500", "dark:text-zinc-400");
		expect(eyebrowElement).not.toHaveClass("text-zinc-400");
		expect(eyebrowElement).not.toHaveClass("dark:text-zinc-500");
	});
});
