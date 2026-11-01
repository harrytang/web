import { act, fireEvent, render, screen, within } from "@testing-library/react";
import type { TocItem } from "@/lib/toc";
import TableOfContents from "./TableOfContents";

const items: TocItem[] = [
	{ id: "introduction", text: "Introduction", level: 2, line: 3 },
	{ id: "details", text: "Details", level: 3, line: 5 },
	{ id: "conclusion", text: "Conclusion", level: 2, line: 9 },
];

const heading = (id: string) => document.getElementById(id) as Element;

describe("TableOfContents", () => {
	let observed: Element[];
	let disconnect: jest.Mock;
	let notify: (entries: Partial<IntersectionObserverEntry>[]) => void;

	beforeEach(() => {
		observed = [];
		disconnect = jest.fn();
		notify = () => {};

		global.IntersectionObserver = jest
			.fn()
			.mockImplementation((callback: IntersectionObserverCallback) => {
				notify = (entries) =>
					callback(
						entries as IntersectionObserverEntry[],
						{} as IntersectionObserver,
					);
				return {
					observe: (element: Element) => observed.push(element),
					unobserve: jest.fn(),
					disconnect,
					takeRecords: () => [],
					root: null,
					rootMargin: "",
					thresholds: [],
				};
			}) as unknown as typeof IntersectionObserver;

		for (const item of items) {
			const element = document.createElement("h2");
			element.id = item.id;
			document.body.appendChild(element);
		}
	});

	afterEach(() => {
		document.body.innerHTML = "";
	});

	it.each([[[]], [[items[0]]]])(
		"renders nothing for fewer than two headings (%j)",
		(few) => {
			const { container } = render(<TableOfContents items={few} />);

			expect(container).toBeEmptyDOMElement();
			expect(global.IntersectionObserver).not.toHaveBeenCalled();
		},
	);

	it("offers a labelled navigation with a link to every heading", () => {
		render(<TableOfContents items={items} />);

		// One copy for desktop and one inside the phone disclosure.
		const navs = screen.getAllByRole("navigation", {
			name: "Table of contents",
		});
		expect(navs).toHaveLength(2);
		for (const nav of navs) {
			for (const item of items) {
				expect(
					within(nav).getByRole("link", { name: item.text }),
				).toHaveAttribute("href", `#${item.id}`);
			}
		}
	});

	it("shows a visible heading on desktop and a disclosure on phones", () => {
		const { container } = render(<TableOfContents items={items} />);

		// A label, not a heading: an h2 before the page h1 would break the outline.
		expect(within(container).queryByRole("heading")).not.toBeInTheDocument();
		expect(container.querySelector("nav.hidden > p")).toHaveTextContent(
			"Table of contents",
		);
		const details = container.querySelector("details");
		expect(details).toHaveClass("lg:hidden");
		expect(details?.querySelector("summary")).toHaveTextContent(
			"Table of contents",
		);
		expect(container.querySelector("nav.hidden")).toHaveClass("lg:block");
	});

	it("indents sub-headings below their section", () => {
		render(<TableOfContents items={items} />);

		const [desktop] = screen.getAllByRole("navigation", {
			name: "Table of contents",
		});
		expect(within(desktop).getByRole("link", { name: "Details" })).toHaveClass(
			"pl-7",
		);
		expect(
			within(desktop).getByRole("link", { name: "Introduction" }),
		).toHaveClass("pl-4");
	});

	it("marks the first heading as the current section to begin with", () => {
		render(<TableOfContents items={items} />);

		for (const link of screen.getAllByRole("link", { name: "Introduction" })) {
			expect(link).toHaveAttribute("aria-current", "location");
		}
		for (const link of screen.getAllByRole("link", { name: "Conclusion" })) {
			expect(link).not.toHaveAttribute("aria-current");
		}
	});

	it("observes only headings that exist on the page", () => {
		document.getElementById("details")?.remove();

		render(<TableOfContents items={items} />);

		expect(observed.map((el) => el.id)).toEqual(["introduction", "conclusion"]);
	});

	it("follows the reader as headings scroll into view", () => {
		render(<TableOfContents items={items} />);

		act(() => {
			notify([{ target: heading("details"), isIntersecting: true }]);
		});

		for (const link of screen.getAllByRole("link", { name: "Details" })) {
			expect(link).toHaveAttribute("aria-current", "location");
		}
		for (const link of screen.getAllByRole("link", { name: "Introduction" })) {
			expect(link).not.toHaveAttribute("aria-current");
		}
	});

	it("prefers the earliest visible heading when several are on screen", () => {
		render(<TableOfContents items={items} />);

		act(() => {
			notify([
				{ target: heading("conclusion"), isIntersecting: true },
				{ target: heading("details"), isIntersecting: true },
			]);
		});

		for (const link of screen.getAllByRole("link", { name: "Details" })) {
			expect(link).toHaveAttribute("aria-current", "location");
		}
	});

	it("keeps the last section highlighted when no heading is in the band", () => {
		render(<TableOfContents items={items} />);

		act(() => {
			notify([{ target: heading("details"), isIntersecting: true }]);
		});
		act(() => {
			notify([{ target: heading("details"), isIntersecting: false }]);
		});

		for (const link of screen.getAllByRole("link", { name: "Details" })) {
			expect(link).toHaveAttribute("aria-current", "location");
		}
	});

	it("marks a clicked section as current and folds the phone disclosure away", () => {
		const { container } = render(<TableOfContents items={items} />);
		const details = container.querySelector("details") as HTMLDetailsElement;
		details.setAttribute("open", "");

		fireEvent.click(within(details).getByRole("link", { name: "Conclusion" }));

		expect(details).not.toHaveAttribute("open");
		for (const link of screen.getAllByRole("link", { name: "Conclusion" })) {
			expect(link).toHaveAttribute("aria-current", "location");
		}
	});

	it("moves focus to the summary when a choice folds the disclosure away", () => {
		const { container } = render(<TableOfContents items={items} />);
		const details = container.querySelector("details") as HTMLDetailsElement;
		details.open = true;

		fireEvent.click(within(details).getByRole("link", { name: "Conclusion" }));

		expect(details.querySelector("summary")).toHaveFocus();
	});

	it("leaves focus alone when the desktop list is used", () => {
		const { container } = render(<TableOfContents items={items} />);
		const desktop = container.querySelector("nav.hidden") as HTMLElement;

		fireEvent.click(within(desktop).getByRole("link", { name: "Conclusion" }));

		expect(container.querySelector("summary")).not.toHaveFocus();
	});

	it("stops observing on unmount", () => {
		const { unmount } = render(<TableOfContents items={items} />);

		unmount();

		expect(disconnect).toHaveBeenCalledTimes(1);
	});
});
