"use client";

import Image from "next/image";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import Link from "next/link";
import {
	isValidElement,
	type ReactElement,
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import remarkGfm from "remark-gfm";
/* local imports */
import { BLUR_IMAGE } from "@/../const";
import { isInternalLink } from "@/lib/helper";
import { extractHeadings } from "@/lib/toc";

// Custom Image component for Markdown
const MarkdownImage = ({ src, alt }: { src?: string; alt?: string }) => {
	if (!src) return null;
	return (
		<Image
			src={src}
			alt={alt || "Markdown Image"}
			width={0}
			height={0}
			sizes="(min-width: 768px) 42rem, 100vw"
			className="h-auto w-full rounded-md"
			priority={true}
			loading="eager"
			placeholder="blur"
			blurDataURL={BLUR_IMAGE}
		/>
	);
};

const getNodeText = (node: ReactNode): string => {
	if (typeof node === "string" || typeof node === "number") {
		return String(node);
	}

	if (Array.isArray(node)) {
		return node.map((item) => getNodeText(item)).join("");
	}

	if (isValidElement(node)) {
		const element = node as ReactElement<{ children?: ReactNode }>;
		return getNodeText(element.props.children);
	}

	return "";
};

const MarkdownRenderer = ({ content }: { content: string }) => {
	const [copiedKey, setCopiedKey] = useState<string | null>(null);
	const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const copyCode = useCallback(async (key: string, code: string) => {
		if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
			return;
		}

		await navigator.clipboard.writeText(code);
		setCopiedKey(key);

		if (copyTimeoutRef.current) {
			clearTimeout(copyTimeoutRef.current);
		}
		copyTimeoutRef.current = setTimeout(() => {
			setCopiedKey(null);
		}, 3000);
	}, []);

	useEffect(() => {
		return () => {
			if (copyTimeoutRef.current) {
				clearTimeout(copyTimeoutRef.current);
			}
		};
	}, []);

	// Anchor ids come from the same list the table of contents is built from,
	// matched by source line. Looking them up is pure, so React Strict Mode's
	// double render cannot shift an id.
	const headingIds = useMemo(
		() => new Map(extractHeadings(content).map((h) => [h.line, h.id])),
		[content],
	);

	return (
		<ReactMarkdown
			remarkPlugins={[remarkGfm]}
			rehypePlugins={[rehypeHighlight]}
			components={{
				h2: ({ node, children, ...props }) => (
					<h2 id={headingIds.get(node?.position?.start.line ?? -1)} {...props}>
						{children}
					</h2>
				),
				h3: ({ node, children, ...props }) => (
					<h3 id={headingIds.get(node?.position?.start.line ?? -1)} {...props}>
						{children}
					</h3>
				),
				pre: ({ children }) => <>{children}</>,
				code: ({ className, children, ...props }) => {
					const languageMatch = /language-(\w+)/.exec(className ?? "");
					const codeText = getNodeText(children).replace(/\n$/, "");

					if (!languageMatch) {
						return (
							<code className={className} {...props}>
								{children}
							</code>
						);
					}

					const language = languageMatch[1];
					const codeKey = `${language}:${codeText}`;

					return (
						<div className="my-4 overflow-hidden rounded-xl border border-zinc-300 bg-zinc-50 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
							<div className="flex items-center justify-between border-b border-zinc-300 bg-zinc-100 px-3 py-2 text-xs text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
								<span>{language}</span>
								<button
									type="button"
									onClick={() => {
										void copyCode(codeKey, codeText);
									}}
									className="rounded-md border border-zinc-400 bg-white px-2 py-1 text-zinc-700 transition hover:cursor-pointer hover:bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-700"
								>
									{copiedKey === codeKey ? "✓ Copied" : "Copy"}
								</button>
							</div>
							<pre className="mdx-code-scroll m-0 overflow-x-auto bg-[#f8fafc] px-4 pt-4 pb-2 text-zinc-900 dark:bg-[#020913] dark:text-zinc-100">
								<code className={className} {...props}>
									{children}
								</code>
							</pre>
						</div>
					);
				},
				img: ({ node, src, ...props }) => (
					<MarkdownImage
						src={typeof src === "string" ? src : undefined}
						{...props}
					/>
				),
				a: ({ href = "", children, ...props }) =>
					isInternalLink(href) ? (
						<Link href={href} {...props}>
							{children}
						</Link>
					) : (
						<a href={href} target="_blank" {...props}>
							{children}
						</a>
					),
			}}
		>
			{content}
		</ReactMarkdown>
	);
};

export { MarkdownRenderer };
