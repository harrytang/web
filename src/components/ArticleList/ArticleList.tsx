import { ChevronRightIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { BLUR_IMAGE } from "@/../const";
import type { Blog } from "@/lib/blogs";
import { formatDate } from "@/lib/helper";

type ArticleListProps = {
	article: Blog;
	/**
	 * `featured` and `card` are the home page's article tiles. `lead` and `row`
	 * are the articles index: the latest post up top, then one row per post.
	 */
	type: "featured" | "card" | "lead" | "row";
	/** Level of the title; h3 under a section heading, h2 on a page of its own. */
	heading?: "h2" | "h3";
};

const ArticleDate: React.FC<{ article: Blog; dot?: boolean }> = ({
	article,
	dot = true,
}) => (
	<time
		dateTime={article.publishedAt}
		className="relative flex items-center gap-3 text-sm text-muted tabular-nums"
	>
		{dot && (
			<span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
		)}
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

/** Outlines the whole item when its (stretched) title link has keyboard focus. */
const FocusRing: React.FC = () => (
	<span
		aria-hidden="true"
		className="pointer-events-none absolute -inset-3 rounded-3xl opacity-0 outline-2 outline-accent group-has-[a:focus-visible]:opacity-100"
	/>
);

/**
 * The post's cover. The covers are text-heavy graphics that repeat the title,
 * so the picture is decorative and the title link names the post.
 */
const Cover: React.FC<{
	article: Blog;
	sizes: string;
	className?: string;
}> = ({ article, sizes, className }) => {
	const url = article.seo.metaImage?.url;
	if (!url) {
		return null;
	}

	return (
		<div
			className={clsx(
				"relative aspect-[1200/630] w-full overflow-hidden bg-surface",
				className,
			)}
		>
			<Image
				src={url}
				alt=""
				fill
				sizes={sizes}
				className="object-cover transition duration-500 motion-safe:group-hover:scale-[1.03]"
				placeholder="blur"
				blurDataURL={BLUR_IMAGE}
			/>
			{/* A hairline edge keeps pale covers from bleeding into a light page. */}
			<div
				aria-hidden="true"
				className="absolute inset-0 ring-1 ring-inset ring-ink/10"
			/>
		</div>
	);
};

const ArticleList: React.FC<ArticleListProps> = ({
	article,
	type,
	heading: Heading = "h3",
}) => {
	const href = `/blog/${article.slug}`;
	const hasCover = Boolean(article.seo.metaImage?.url);

	if (type === "lead") {
		return (
			<article className="group relative grid items-center gap-8 pb-12 first:pt-0 last:pb-0 lg:grid-cols-12 lg:gap-12">
				<Cover
					article={article}
					sizes="(min-width: 1280px) 42rem, (min-width: 1024px) 55vw, 100vw"
					className="rounded-3xl shadow-2xl shadow-black/10 lg:col-span-7"
				/>
				<div className={hasCover ? "lg:col-span-5" : "lg:col-span-12"}>
					<div className="flex flex-wrap items-center gap-x-4 gap-y-2">
						<span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold tracking-[0.2em] text-accent uppercase">
							Latest
						</span>
						<ArticleDate article={article} />
					</div>
					<Heading className="mt-5 text-3xl/9 font-semibold tracking-[-0.03em] text-balance text-ink transition group-hover:text-accent sm:text-4xl/[1.15]">
						<Link href={href} className="focus-visible:outline-none">
							<span className="absolute inset-0 z-10" />
							{article.title}
						</Link>
					</Heading>
					<p className="mt-5 line-clamp-4 text-lg/8 font-light text-pretty text-muted">
						{article.seo.metaDescription}
					</p>
					<ReadArticle className="mt-8" />
				</div>
				<FocusRing />
			</article>
		);
	}
	if (type === "row") {
		return (
			<article
				className={clsx(
					"group relative grid items-start gap-x-8 gap-y-4 py-10 first:pt-0 last:pb-0",
					hasCover
						? "[grid-template-areas:'cover'_'date'_'body'] sm:grid-cols-[minmax(0,1fr)_14rem] sm:[grid-template-areas:'date_cover'_'body_cover'] lg:grid-cols-[8rem_minmax(0,1fr)_16rem] lg:gap-x-10 lg:[grid-template-areas:'date_body_cover']"
						: "[grid-template-areas:'date'_'body'] lg:grid-cols-[8rem_minmax(0,1fr)] lg:gap-x-10 lg:[grid-template-areas:'date_body']",
				)}
			>
				<Cover
					article={article}
					sizes="(min-width: 1024px) 16rem, (min-width: 640px) 14rem, 100vw"
					className="rounded-2xl [grid-area:cover]"
				/>
				<div className="[grid-area:date] lg:pt-1.5">
					<ArticleDate article={article} dot={false} />
				</div>
				<div className="min-w-0 [grid-area:body]">
					<Heading className="text-xl/7 font-semibold tracking-[-0.02em] text-pretty text-ink transition group-hover:text-accent">
						<Link href={href} className="focus-visible:outline-none">
							<span className="absolute inset-0 z-10" />
							{article.title}
						</Link>
					</Heading>
					<p className="mt-3 line-clamp-2 max-w-2xl text-base/7 font-light text-muted">
						{article.seo.metaDescription}
					</p>
					<ReadArticle className="mt-4" />
				</div>
				<FocusRing />
			</article>
		);
	}
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
