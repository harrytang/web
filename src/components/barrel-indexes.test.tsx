jest.mock("remark-gfm", () => ({
	__esModule: true,
	default: () => {},
}));

jest.mock("rehype-highlight", () => ({
	__esModule: true,
	default: () => {},
}));

import { AlgoliaSearch } from "@/components/AlgoliaSearch";
import { BlogLayout } from "@/components/BlogLayout";
import { CommentBox } from "@/components/CommentBox";
import { CSE } from "@/components/CSE";
import { Gallery } from "@/components/Gallery";
import { Layout } from "@/components/Layout";
import { MoreArticle } from "@/components/MoreArticle";
import { Pagination } from "@/components/Pagination";
import { SearchBox } from "@/components/SearchBox";
import { Section } from "@/components/Section";
import { SimpleLayout } from "@/components/SimpleLayout";
import { SocialLink } from "@/components/SocialLink";
import { ThemeWatcher } from "@/components/ThemeWatcher";
import { Tool, ToolsSection } from "@/components/Tool";
import { Role, Work } from "@/components/Work";

describe("barrel exports", () => {
	it("exports component modules from barrel index files", () => {
		expect(AlgoliaSearch).toBeDefined();
		expect(BlogLayout).toBeDefined();
		expect(CommentBox).toBeDefined();
		expect(CSE).toBeDefined();
		expect(Gallery).toBeDefined();
		expect(Layout).toBeDefined();
		expect(MoreArticle).toBeDefined();
		expect(Pagination).toBeDefined();
		expect(SearchBox).toBeDefined();
		expect(Section).toBeDefined();
		expect(SimpleLayout).toBeDefined();
		expect(SocialLink).toBeDefined();
		expect(ThemeWatcher).toBeDefined();
		expect(Tool).toBeDefined();
		expect(ToolsSection).toBeDefined();
		expect(Role).toBeDefined();
		expect(Work).toBeDefined();
	});
});
