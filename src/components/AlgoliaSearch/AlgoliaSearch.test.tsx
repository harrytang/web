import { fireEvent, render, screen } from "@testing-library/react";
import type React from "react";
import AlgoliaSearch from "./AlgoliaSearch";

const algoliaSearchMock = jest.fn(
	(requests: { indexName: string; params: { query?: string } }[]) =>
		Promise.resolve({ results: requests }),
);
let capturedSearchClient: {
	search: (
		requests: { indexName: string; params: { query?: string } }[],
	) => Promise<unknown>;
} | null = null;
let capturedIndexName: string | null = null;

jest.mock("next/link", () => ({
	__esModule: true,
	default: ({
		children,
		href,
	}: {
		children: React.ReactNode;
		href: string;
	}) => <a href={href}>{children}</a>,
}));

jest.mock("@heroicons/react/20/solid", () => ({
	MagnifyingGlassIcon: () => <span data-testid="search-icon" />,
	ArrowPathIcon: () => <span data-testid="loading-icon" />,
}));

jest.mock("algoliasearch/lite", () => ({
	liteClient: jest.fn(() => ({
		search: (requests: { indexName: string; params: { query?: string } }[]) =>
			algoliaSearchMock(requests),
	})),
}));

jest.mock("react-instantsearch-nextjs", () => ({
	InstantSearchNext: ({
		children,
		searchClient,
		indexName,
	}: {
		children: React.ReactNode;
		searchClient: {
			search: <TObject>(
				requests: { indexName: string; params: { query?: string } }[],
			) => Promise<TObject>;
		};
		indexName: string;
	}) => {
		capturedSearchClient = searchClient;
		capturedIndexName = indexName;
		return <div data-testid="instant-search">{children}</div>;
	},
}));

jest.mock("react-instantsearch", () => ({
	SearchBox: ({
		placeholder,
		submitIconComponent,
		loadingIconComponent,
	}: {
		placeholder: string;
		submitIconComponent: () => React.ReactNode;
		loadingIconComponent: () => React.ReactNode;
	}) => (
		<div>
			<input aria-label="algolia-search" placeholder={placeholder} />
			<div data-testid="submit-icon">{submitIconComponent()}</div>
			<div data-testid="loading-icon-wrapper">{loadingIconComponent()}</div>
		</div>
	),
	Hits: ({
		hitComponent: HitComponent,
	}: {
		hitComponent: React.ComponentType<{
			hit: { objectID: string; title: string; description: string };
		}>;
	}) => (
		<div data-testid="hits">
			<HitComponent
				hit={{
					objectID: "first-post",
					title: "First Post",
					description: "First description",
				}}
			/>
		</div>
	),
	Highlight: ({
		attribute,
		hit,
	}: {
		attribute: "title" | "description";
		hit: { title: string; description: string };
	}) => <span>{hit[attribute]}</span>,
	Configure: ({ hitsPerPage }: { hitsPerPage: number }) => (
		<div data-testid="configure">{hitsPerPage}</div>
	),
}));

describe("AlgoliaSearch", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		capturedSearchClient = null;
		capturedIndexName = null;
		document.body.className = "";
		algoliaSearchMock.mockResolvedValue({ results: [] });
	});

	it("opens the modal, renders hits, and closes on backdrop click", () => {
		const { unmount } = render(<AlgoliaSearch />);

		fireEvent.focus(screen.getByPlaceholderText("Search articles"));

		expect(screen.getByTestId("instant-search")).toBeInTheDocument();
		expect(
			screen.getByPlaceholderText("Type your search here..."),
		).toBeInTheDocument();
		expect(screen.getByTestId("configure")).toHaveTextContent("10");
		expect(screen.getByText("First Post")).toBeInTheDocument();
		expect(screen.getByText("First description")).toBeInTheDocument();
		expect(screen.getByRole("link", { name: /First Post/i })).toHaveAttribute(
			"href",
			"/blog/first-post",
		);
		expect(document.body.classList.contains("overflow-hidden")).toBe(true);

		const keyEvent = new KeyboardEvent("keydown", {
			key: "Tab",
			cancelable: true,
		});
		document.dispatchEvent(keyEvent);
		expect(keyEvent.defaultPrevented).toBe(true);

		fireEvent.click(
			screen.getByRole("button", { name: "Close search dialog" }),
		);
		expect(screen.queryByTestId("instant-search")).not.toBeInTheDocument();
		expect(document.body.classList.contains("overflow-hidden")).toBe(false);

		unmount();
		expect(document.body.classList.contains("overflow-hidden")).toBe(false);
	});

	it("uses empty-query shortcut and delegates non-empty queries to algolia client", async () => {
		render(<AlgoliaSearch />);
		fireEvent.focus(screen.getByPlaceholderText("Search articles"));

		expect(capturedSearchClient).not.toBeNull();

		const emptyResult = await capturedSearchClient?.search([
			{ indexName: "articles_index", params: { query: "   " } },
		]);
		expect(emptyResult).toEqual({
			results: [
				{
					hits: [],
					nbHits: 0,
					nbPages: 0,
					page: 0,
					processingTimeMS: 0,
					hitsPerPage: 0,
					exhaustiveNbHits: false,
					query: "",
					params: "",
				},
			],
		});
		expect(algoliaSearchMock).not.toHaveBeenCalled();

		await capturedSearchClient?.search([
			{ indexName: "articles_index", params: { query: "react" } },
		]);
		expect(algoliaSearchMock).toHaveBeenCalledWith([
			{ indexName: "articles_index", params: { query: "react" } },
		]);
	});

	it("uses default index name and does not prevent non-Tab keys", () => {
		delete process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME;
		render(<AlgoliaSearch />);
		fireEvent.focus(screen.getByPlaceholderText("Search articles"));

		expect(capturedIndexName).toBe("articles_index");

		const keyEvent = new KeyboardEvent("keydown", {
			key: "Escape",
			cancelable: true,
		});
		document.dispatchEvent(keyEvent);
		expect(keyEvent.defaultPrevented).toBe(false);
	});
});
