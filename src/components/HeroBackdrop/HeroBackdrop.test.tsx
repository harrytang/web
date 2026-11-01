import { render } from "@testing-library/react";
import HeroBackdrop from "./HeroBackdrop";

describe("HeroBackdrop", () => {
	it("is purely decorative: every layer is hidden from assistive technology", () => {
		const { container } = render(<HeroBackdrop />);

		const layers = Array.from(container.children);
		expect(layers).toHaveLength(3);
		layers.forEach((layer) => {
			expect(layer).toHaveAttribute("aria-hidden", "true");
		});
	});

	it("fades into the page background so the grid never ends on a hard line", () => {
		const { container } = render(<HeroBackdrop />);

		const fade = container.lastElementChild;
		expect(fade).toHaveClass("bottom-0", "to-canvas");
	});

	it("sits behind the hero content", () => {
		const { container } = render(<HeroBackdrop />);

		Array.from(container.children).forEach((layer) => {
			expect(layer).toHaveClass("-z-10");
		});
	});

	it("fills the grid rect with the pattern it defines", () => {
		const { container } = render(<HeroBackdrop />);

		const pattern = container.querySelector("pattern");
		const rect = container.querySelector("rect");
		expect(pattern?.id).toBeTruthy();
		expect(rect).toHaveAttribute("fill", `url(#${pattern?.id})`);
	});

	it("gives every instance its own valid pattern id", () => {
		const { container } = render(
			<>
				<HeroBackdrop />
				<HeroBackdrop />
			</>,
		);

		const [first, second] = Array.from(container.querySelectorAll("pattern"));
		expect(first.id).not.toEqual(second.id);
		// Safe to use inside url(#...): letters and digits only.
		expect(first.id).toMatch(/^grid-[a-zA-Z0-9]+$/);
	});
});
