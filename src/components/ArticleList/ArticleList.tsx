import { ChevronRightIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import Link from "next/link";
import type { Blog } from "@/lib/blogs";
import { formatDate } from "@/lib/helper";

type ArticleListProps = {
	article: Blog;
	type: "featured" | "card";
	/** Level of the title; h3 under a section heading, h2 on a page of its own. */
	heading?: "h2" | "h3";
};

const ArticleDate: React.FC<{ article: Blog }> = ({ article }) => (
	<time
		dateTime={article.publishedAt}
		className="relative flex items-center gap-3 text-sm text-muted"
	>
		<span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
		{formatDate(article.publishedAt)}
	</time>
);

const ReadArticle: React.FC<{ className?: string }> = ({ className }) => (
	<p
		aria-hidden="true"
		className={clsx(
			"flex items-center gap-1.5 text-sm font-semibold text-accent",
			className,
		)}
	>
		Read article
		<ChevronRightIcon className="size-4 transition group-hover:translate-x-0.5" />
	</p>
);

const ArticleList: React.FC<ArticleListProps> = ({
	article,
	type,
	heading: Heading = "h3",
}) => {
	const href = `/blog/${article.slug}`;

	if (type === "featured") {
		return (
			<article className="group relative overflow-hidden rounded-3xl bg-raised p-8 shadow-2xl shadow-black/10 ring-1 ring-line transition duration-300 hover:ring-accent/40 sm:p-10">
				<div
					aria-hidden="true"
					className="pointer-events-none absolute -top-28 -right-28 size-72 rounded-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--accent)_24%,transparent),transparent)]"
				/>
				<ArticleDate article={article} />
				<Heading className="mt-6 text-3xl/9 font-semibold tracking-[-0.03em] text-balance text-ink sm:text-4xl/[1.15]">
					<Link href={href}>
						<span className="absolute inset-0 z-10" />
						{article.title}
					</Link>
				</Heading>
				<p className="mt-6 max-w-2xl text-lg/8 font-light text-pretty text-muted">
					{article.seo.metaDescription}
				</p>
				<ReadArticle className="mt-8" />
			</article>
		);
	}

	return (
		<article className="group relative flex flex-col rounded-3xl bg-raised p-7 ring-1 ring-line transition duration-300 hover:-translate-y-0.5 hover:ring-accent/40">
			<ArticleDate article={article} />
			<Heading className="mt-5 text-xl/7 font-semibold tracking-[-0.02em] text-pretty text-ink transition group-hover:text-accent">
				<Link href={href}>
					<span className="absolute inset-0 z-10 rounded-3xl" />
					{article.title}
				</Link>
			</Heading>
			<p className="mt-4 flex-1 text-base/7 font-light text-muted">
				{article.seo.metaDescription}
			</p>
			<ReadArticle className="mt-6" />
		</article>
	);
};

export default ArticleList;
