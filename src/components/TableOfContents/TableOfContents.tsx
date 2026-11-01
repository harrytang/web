"use client";

import { ChevronDownIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import type { TocItem } from "@/lib/toc";

/** A contents list only helps once a post has at least this many sections. */
export const MIN_TOC_ITEMS = 2;

type TableOfContentsProps = {
	items: TocItem[];
};

type TocListProps = {
	items: TocItem[];
	activeId: string | null;
	onNavigate: (id: string) => void;
};

const TocList: React.FC<TocListProps> = ({ items, activeId, onNavigate }) => (
	<ol className="space-y-0.5 border-l border-line">
		{items.map((item) => {
			const isActive = item.id === activeId;

			return (
				<li key={item.id}>
					<a
						href={`#${item.id}`}
						aria-current={isActive ? "location" : undefined}
						onClick={() => onNavigate(item.id)}
						className={clsx(
							"-ml-px block border-l-2 py-1.5 pr-2 text-sm/5 transition",
							item.level === 3 ? "pl-7" : "pl-4",
							isActive
								? "border-accent font-medium text-accent"
								: "border-transparent text-muted hover:border-line hover:text-ink",
						)}
					>
						{item.text}
					</a>
				</li>
			);
		})}
	</ol>
);

const TableOfContents: React.FC<TableOfContentsProps> = ({ items }) => {
	const enabled = items.length >= MIN_TOC_ITEMS;
	const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);
	const detailsRef = useRef<HTMLDetailsElement>(null);
	const summaryRef = useRef<HTMLElement>(null);

	// Follow the reader: the current section is the first heading that sits in
	// the top band of the viewport, just below the sticky header.
	useEffect(() => {
		if (!enabled) {
			return;
		}

		const visible = new Set<string>();
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						visible.add(entry.target.id);
					} else {
						visible.delete(entry.target.id);
					}
				}
				const current = items.find((item) => visible.has(item.id));
				if (current) {
					setActiveId(current.id);
				}
			},
			{ rootMargin: "-80px 0px -65% 0px" },
		);

		for (const item of items) {
			const heading = document.getElementById(item.id);
			if (heading) {
				observer.observe(heading);
			}
		}

		return () => observer.disconnect();
	}, [items, enabled]);

	if (!enabled) {
		return null;
	}

	const handleNavigate = (id: string) => {
		setActiveId(id);
		// On phones the list lives in a disclosure; fold it away after a choice and
		// hand focus to the summary so it doesn't vanish with the closed list.
		const details = detailsRef.current;
		if (details?.open) {
			details.removeAttribute("open");
			summaryRef.current?.focus();
		}
	};

	return (
		<>
			<details
				ref={detailsRef}
				className="group rounded-2xl bg-raised ring-1 ring-line lg:hidden"
			>
				<summary
					ref={summaryRef}
					className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden"
				>
					Table of contents
					<ChevronDownIcon
						aria-hidden="true"
						className="size-5 text-muted transition group-open:rotate-180"
					/>
				</summary>
				<nav aria-label="Table of contents" className="px-5 pb-5">
					<TocList
						items={items}
						activeId={activeId}
						onNavigate={handleNavigate}
					/>
				</nav>
			</details>

			<nav aria-label="Table of contents" className="hidden lg:block">
				<p className="text-sm font-semibold tracking-[0.2em] text-accent uppercase">
					Table of contents
				</p>
				<div className="mt-5">
					<TocList
						items={items}
						activeId={activeId}
						onNavigate={handleNavigate}
					/>
				</div>
			</nav>
		</>
	);
};

export default TableOfContents;
