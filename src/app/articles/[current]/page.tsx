import { ChevronRightIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { ArticleList } from "@/components/ArticleList";
import { Pagination } from "@/components/Pagination";
import { SimpleLayout } from "@/components/SimpleLayout";
import { getBlogs } from "@/lib/blogs";
import {
	generateListArticleJsonLd,
	generateSeoMeta,
	generateWebPageJsonLd,
} from "@/lib/helper";
import { getPage } from "@/lib/pages";

export async function generateMetadata({ params }: ArticlesIndexProps) {
	const page = await getPage("articles");
	const { current } = await params;
	const seo = {
		...page.seo,
		metaTitle: `${page.seo.metaTitle} - Page ${current}`,
		metaDescription: `${page.seo.metaDescription} (Page ${current})`,
	};
	const path = current === "1" ? "articles" : `articles/${current}`;
	return generateSeoMeta(path, seo, "website", page.locale);
}

export async function generateStaticParams(): Promise<{ current: string }[]> {
	const pageSize = parseInt(process.env.NEXT_PUBLIC_PAGE_SIZE ?? "10", 10);
	const blogs = await getBlogs(0, 1); // Fetch total count
	const totalPages = Math.ceil(blogs.meta.pagination.total / pageSize);
	return Array.from({ length: totalPages }, (_, i) => ({
		current: (i + 1).toString(),
	}));
}

interface ArticlesIndexProps {
	params: Promise<{
		current: string;
	}>;
}

const ArticlesIndex = async ({ params }: ArticlesIndexProps) => {
	console.info("Rendering /articles");

	// article page
	const articlePage = await getPage("articles");
	const pageJsonld = generateWebPageJsonLd({
		name: articlePage.title,
		description: articlePage.seo.metaDescription,
	});

	// blogs & pagination
	const { current } = await params;
	const pageIdx = parseInt(current || "1", 10) - 1;
	const pageSize = parseInt(process.env.NEXT_PUBLIC_PAGE_SIZE ?? "10", 10);
	const start = pageIdx * pageSize;
	const blogs = await getBlogs(start, pageSize);
	const articlesJsonld = generateListArticleJsonLd(blogs.data);
	const totalPages = Math.ceil(blogs.meta.pagination.total / pageSize);
	// The first page opens with the latest post; later pages are plain rows.
	const isFirstPage = pageIdx === 0;
	const lead = isFirstPage ? blogs.data[0] : undefined;
	const rows = isFirstPage ? blogs.data.slice(1) : blogs.data;

	return (
		<div id="blogs">
			<SimpleLayout
				subtitle={articlePage.subtitle}
				content={articlePage.content}
				seachBox={true}
			>
				{blogs.data.length === 0 ? (
					<div className="rounded-3xl bg-raised px-6 py-14 text-center ring-1 ring-line">
						<p className="text-lg text-muted">No articles on this page.</p>
						<Link
							href="/articles"
							className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline"
						>
							Back to the latest articles
							<ChevronRightIcon aria-hidden="true" className="size-4" />
						</Link>
					</div>
				) : (
					<div className="divide-y divide-line">
						{lead && <ArticleList article={lead} type="lead" heading="h2" />}
						{rows.map((blog) => (
							<ArticleList
								key={blog.id}
								article={blog}
								type="row"
								heading="h2"
							/>
						))}
					</div>
				)}
				{blogs.data.length > 0 && (
					<div className="mt-14">
						<Pagination totalPages={totalPages} currentPage={pageIdx + 1} />
					</div>
				)}
				<script type="application/ld+json">{JSON.stringify(pageJsonld)}</script>
				<script type="application/ld+json">
					{JSON.stringify(articlesJsonld)}
				</script>
			</SimpleLayout>
		</div>
	);
};

export default ArticlesIndex;
