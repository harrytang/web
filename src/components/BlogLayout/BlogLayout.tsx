"use client";

import {
	ArrowLeftIcon,
	InformationCircleIcon,
	PlayCircleIcon,
} from "@heroicons/react/20/solid";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useContext, useEffect, useRef, useState } from "react";
import { BLUR_IMAGE } from "@/../const";
// local imports
import { AppContext } from "@/app/providers";
import { Container } from "@/components/Container";
import { Prose } from "@/components/Prose";
import type { Blog } from "@/lib/blogs";
import { formatDate } from "@/lib/helper";
import { MarkdownRenderer } from "../mdx";
import BMC from "./BMC";

// dynamic imports
const ReactPlayer = dynamic(() => import("react-player"), { ssr: false });
const CommentBox = dynamic(() => import("@/components/CommentBox/CommentBox"), {
	ssr: false,
});

type BlogLayoutProps = {
	blog: Blog;
};

const BlogLayout: React.FC<BlogLayoutProps> = ({ blog }) => {
	const router = useRouter();
	const { previousPathname } = useContext(AppContext);
	const [showComments, setShowComments] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const commentTriggerRef = useRef<HTMLDivElement | null>(null);
	const hasVideo = blog.attributes.mediaUrl;
	const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${blog.attributes.slug}`;
	const encodedPostUrl = encodeURIComponent(postUrl);
	const encodedTitle = encodeURIComponent(blog.attributes.title);
	const shareLinks = [
		{
			name: "X",
			href: `https://x.com/intent/post?url=${encodedPostUrl}&text=${encodedTitle}`,
			icon: (
				<svg
					viewBox="0 0 24 24"
					aria-hidden="true"
					className="h-5 w-5 cursor-pointer"
				>
					<path fill="currentColor" d="M13.9 10.5 21.3 2h-1.8l-6.4 7.4L8 2H2l7.8 11.3L2 22h1.8l6.8-7.8L16 22h6l-8.1-11.5Zm-2.4 2.8-.8-1.1L4.4 3.3h2.7l5 7.1.8 1.1 6.6 9.4h-2.7l-5.3-7.6Z" />
				</svg>
			),
		},
		{
			name: "Facebook",
			href: `https://www.facebook.com/sharer/sharer.php?u=${encodedPostUrl}`,
			icon: (
				<svg
					viewBox="0 0 24 24"
					aria-hidden="true"
					className="h-5 w-5 cursor-pointer"
				>
					<path fill="currentColor" d="M22 12.1C22 6.5 17.5 2 11.9 2S2 6.5 2 12.1c0 5 3.7 9.2 8.4 10v-7.1H7.9v-2.9h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6v1.9h2.8l-.4 2.9h-2.3v7.1c4.8-.8 8.4-5 8.4-10Z" />
				</svg>
			),
		},
		{
			name: "LinkedIn",
			href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedPostUrl}`,
			icon: (
				<svg
					viewBox="0 0 24 24"
					aria-hidden="true"
					className="h-5 w-5 cursor-pointer"
				>
					<path fill="currentColor" d="M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.3V9h3.4v1.6h.1c.5-.9 1.7-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5v6.2ZM5.2 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2Zm1.8 13.1H3.4V9H7v11.5Z" />
				</svg>
			),
		},
	];

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					setShowComments(true);
				}
			},
			{ threshold: 1.0 },
		);

		const commentTriggerElement = commentTriggerRef.current;

		if (commentTriggerElement) {
			observer.observe(commentTriggerElement);
		}

		return () => {
			if (commentTriggerElement) {
				observer.unobserve(commentTriggerElement);
			}
		};
	}, []);

	return (
		<Container className="mt-16 lg:mt-32">
			<div className="xl:relative">
				<div className="mx-auto max-w-2xl">
					{previousPathname && (
						<button
							type="button"
							onClick={() => router.back()}
							aria-label="Go back to articles"
							className="group mb-8 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md ring-1 shadow-zinc-800/5 ring-zinc-900/5 transition lg:absolute lg:-left-5 lg:-mt-2 lg:mb-0 xl:-top-1.5 xl:left-0 xl:mt-0 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0 dark:ring-white/10 dark:hover:border-zinc-700 dark:hover:ring-white/20"
						>
							<ArrowLeftIcon className="h-4 w-4 stroke-zinc-500 transition group-hover:stroke-zinc-700 dark:stroke-zinc-500 dark:group-hover:stroke-zinc-400" />
						</button>
					)}
					<article lang={blog.attributes.locale}>
						<header className="flex flex-col">
							<h1 className="mt-6 text-4xl font-bold tracking-tight text-zinc-800 sm:text-5xl dark:text-zinc-100">
								{blog.attributes.title}
							</h1>
							<nav
								aria-label="Share this post"
								className="mt-6 flex gap-3"
							>
								{shareLinks.map((link) => (
									<a
										key={link.name}
										href={link.href}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={`Share on ${link.name}`}
										style={{ cursor: "pointer" }}
										className="flex h-9 w-9 cursor-pointer items-center justify-center rounded border border-zinc-200 text-zinc-500 transition hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-800 dark:border-zinc-700/60 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-100"
									>
										{link.icon}
									</a>
								))}
							</nav>
							<time
								dateTime={blog.attributes.publishedAt}
								className="order-first flex items-center text-base text-zinc-500 dark:text-zinc-500"
							>
								<span className="h-4 w-0.5 rounded-full bg-zinc-200 dark:bg-zinc-500" />
								<span className="ml-3">
									{formatDate(blog.attributes.publishedAt)}
								</span>
							</time>
						</header>
						<Prose className="mt-8" data-mdx-content>
							{/* Video Placeholder with Play Button */}
							{hasVideo && !isPlaying ? (
								<div className="relative aspect-video w-full overflow-hidden rounded-md bg-gray-900">
									<Image
										className="h-full w-full object-cover"
										src={blog.attributes.seo.metaImage.data.attributes.url}
										alt={blog.attributes.seo.metaImage.data.attributes.caption}
										width={blog.attributes.seo.metaImage.data.attributes.width}
										height={
											blog.attributes.seo.metaImage.data.attributes.height
										}
										priority={true}
										loading="eager"
										placeholder="blur"
										blurDataURL={BLUR_IMAGE}
									/>

									{/* Play Button Overlay */}
									<button
										type="button"
										onClick={() => setIsPlaying(true)}
										className="absolute inset-0 flex items-center justify-center bg-black/50 transition hover:cursor-pointer hover:bg-black/30"
										aria-label="Play Video"
									>
										<PlayCircleIcon className="h-20 w-20 text-white drop-shadow-lg" />
									</button>
								</div>
							) : (
								// Load ReactPlayer when user clicks play
								isPlaying && (
									<div className="player-wrapper">
										<ReactPlayer
											className="react-player"
											src={blog.attributes.mediaUrl}
											width="100%"
											height="100%"
											controls={true}
											playing={true}
											muted={false}
										/>
									</div>
								)
							)}

							{!hasVideo && (
								<figure className="mt-16">
									<Image
										className="rounded-md object-cover"
										src={blog.attributes.seo.metaImage.data.attributes.url}
										alt={blog.attributes.seo.metaImage.data.attributes.caption}
										width={blog.attributes.seo.metaImage.data.attributes.width}
										height={
											blog.attributes.seo.metaImage.data.attributes.height
										}
										priority={true}
										loading="eager"
										placeholder="blur"
										blurDataURL={BLUR_IMAGE}
									/>
									<figcaption className="mt-4 flex justify-center gap-x-2 text-sm leading-6 text-gray-500">
										<InformationCircleIcon
											className="mt-0.5 h-5 w-5 flex-none text-gray-300"
											aria-hidden="true"
										/>
										{blog.attributes.seo.metaImage.data.attributes.caption}
									</figcaption>
								</figure>
							)}

							<MarkdownRenderer content={blog.attributes.content} />

							{/* Buy me a coffee */}
							<BMC />

							{/* Intersection Observer Trigger */}
							<div ref={commentTriggerRef} className="relative">
								<div
									aria-hidden="true"
									className="absolute inset-0 flex items-center"
								>
									<div className="w-full border-t border-zinc-600" />
								</div>
							</div>

							{/* Lazy Load Comments when user scrolls to the end */}
							{showComments && (
								<CommentBox
									location={`${process.env.NEXT_PUBLIC_SITE_URL}/blog/${blog.attributes.slug}`}
								/>
							)}
						</Prose>
					</article>
				</div>
			</div>
		</Container>
	);
};

export default BlogLayout;
