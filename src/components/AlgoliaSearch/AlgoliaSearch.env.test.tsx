import type { ReactNode } from "react";

describe("AlgoliaSearch env initialization", () => {
	const originalEnv = process.env;

	beforeEach(() => {
		jest.resetModules();
		process.env = { ...originalEnv };
	});

	afterAll(() => {
		process.env = originalEnv;
	});

	it("passes configured Algolia env vars to lite client", async () => {
		process.env.NEXT_PUBLIC_ALGOLIA_APP_ID = "app-id";
		process.env.NEXT_PUBLIC_ALGOLIA_API_KEY = "api-key";

		const liteClient = jest.fn(() => ({ search: jest.fn() }));
		jest.doMock("algoliasearch/lite", () => ({ liteClient }));
		jest.doMock("next/link", () => ({
			__esModule: true,
			default: ({ children }: { children: ReactNode }) => children,
		}));
		jest.doMock("@heroicons/react/20/solid", () => ({
			MagnifyingGlassIcon: () => null,
			ArrowPathIcon: () => null,
		}));
		jest.doMock("react-instantsearch-nextjs", () => ({
			InstantSearchNext: ({ children }: { children: ReactNode }) => children,
		}));
		jest.doMock("react-instantsearch", () => ({
			Configure: () => null,
			Highlight: () => null,
			Hits: () => null,
			SearchBox: () => null,
		}));

		await import("./AlgoliaSearch");

		expect(liteClient).toHaveBeenCalledWith("app-id", "api-key");
	});

	it("falls back to empty strings when Algolia env vars are absent", async () => {
		delete process.env.NEXT_PUBLIC_ALGOLIA_APP_ID;
		delete process.env.NEXT_PUBLIC_ALGOLIA_API_KEY;

		const liteClient = jest.fn(() => ({ search: jest.fn() }));
		jest.doMock("algoliasearch/lite", () => ({ liteClient }));
		jest.doMock("next/link", () => ({
			__esModule: true,
			default: ({ children }: { children: ReactNode }) => children,
		}));
		jest.doMock("@heroicons/react/20/solid", () => ({
			MagnifyingGlassIcon: () => null,
			ArrowPathIcon: () => null,
		}));
		jest.doMock("react-instantsearch-nextjs", () => ({
			InstantSearchNext: ({ children }: { children: ReactNode }) => children,
		}));
		jest.doMock("react-instantsearch", () => ({
			Configure: () => null,
			Highlight: () => null,
			Hits: () => null,
			SearchBox: () => null,
		}));

		await import("./AlgoliaSearch");

		expect(liteClient).toHaveBeenCalledWith("", "");
	});
});
