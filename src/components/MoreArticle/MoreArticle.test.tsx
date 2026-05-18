import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type Blog, getBlogs } from "@/lib/blogs";
// local imports
import MoreArticle from "./MoreArticle";

const listBlogs2: Partial<Blog>[] = [
	{
		id: 1,
		attributes: { slug: "post-1" },
	},
	{
		id: 2,
		attributes: { slug: "post-2" },
	},
	{
		id: 3,
		attributes: { slug: "post-3" },
	},
	{
		id: 4,
		attributes: { slug: "post-4" },
	},
	{
		id: 5,
		attributes: { slug: "post-5" },
	},
];

const listBlogs3: Partial<Blog>[] = [
	{
		id: 6,
		attributes: { slug: "post-6" },
	},
];

jest.mock("@/lib/blogs", () => ({
	getBlogs: jest.fn(),
}));

jest.mock(
	"@/components/ArticleList/ArticleList",
	() =>
		({ article }: { article: Blog }) => <div>{article.attributes.slug}</div>,
);

describe("MoreArticle", () => {
	const mockGetBlogs = getBlogs as jest.Mock;
	const originalPageSize = process.env.NEXT_PUBLIC_PAGE_SIZE;

	afterEach(() => {
		process.env.NEXT_PUBLIC_PAGE_SIZE = originalPageSize;
	});

	it("renders correctly", async () => {
		render(<MoreArticle total={6} type="compact" />);

		// Initially, no articles should be displayed
		listBlogs2.forEach((blog) => {
			expect(screen.queryByText(blog.attributes.slug)).not.toBeInTheDocument();
		});

		// Load more articles (#1)
		mockGetBlogs.mockResolvedValue({
			data: listBlogs2 as Blog[],
			meta: { pagination: { total: 11 } },
		});
		const button = screen.getByText("Load more");
		await userEvent.click(button);

		listBlogs2.forEach((blog) => {
			expect(screen.getByText(blog.attributes.slug)).toBeInTheDocument();
		});

		// Button should be present as not all articles are loaded
		expect(screen.queryByText("Load more")).toBeInTheDocument();

		// Load more articles (#2)
		mockGetBlogs.mockResolvedValue({
			data: listBlogs3 as Blog[],
			meta: { pagination: { total: 11 } },
		});
		await userEvent.click(button);

		listBlogs3.forEach((blog) => {
			expect(screen.getByText(blog.attributes.slug)).toBeInTheDocument();
		});

		// Button should not be present as all articles are loaded
		expect(screen.queryByText("Load more")).not.toBeInTheDocument();
	});

	it("uses default page size when NEXT_PUBLIC_PAGE_SIZE is missing", async () => {
		delete process.env.NEXT_PUBLIC_PAGE_SIZE;
		mockGetBlogs.mockResolvedValueOnce({
			data: listBlogs2 as Blog[],
			meta: { pagination: { total: 25 } },
		});

		render(<MoreArticle total={25} type="compact" />);
		await userEvent.click(screen.getByText("Load more"));

		expect(mockGetBlogs).toHaveBeenCalledWith(10, 10);
	});
});
