import Image from "next/image";
import Link from "next/link";
import type { Work } from "@/lib/works";

const Role = async ({ role }: { role: Work }) => {
	const endLabel = role.attributes.end ?? "Present";
	const endDate = role.attributes.end ?? new Date().getFullYear().toString();
	const roleUrl = role.attributes.url?.href;
	const roleLinkLabel = role.attributes.url?.label || role.attributes.company;
	const isInternalUrl = roleUrl?.startsWith("/");

	return (
		<li className="group relative flex gap-4">
			{roleUrl ? (
				<>
					<div className="absolute -inset-x-4 -inset-y-3 z-0 scale-95 bg-zinc-50 opacity-0 transition group-hover:scale-100 group-hover:opacity-100 sm:rounded-2xl dark:bg-zinc-800/50" />
					{isInternalUrl ? (
						<Link
							className="absolute -inset-x-4 -inset-y-3 z-20 sm:rounded-2xl"
							href={roleUrl}
							aria-label={`Visit ${roleLinkLabel}`}
						>
							<span className="sr-only">Visit {roleLinkLabel}</span>
						</Link>
					) : (
						<a
							className="absolute -inset-x-4 -inset-y-3 z-20 sm:rounded-2xl"
							href={roleUrl}
							target="_blank"
							rel="noreferrer"
							aria-label={`Visit ${roleLinkLabel}`}
						>
							<span className="sr-only">Visit {roleLinkLabel}</span>
						</a>
					)}
				</>
			) : null}
			<div className="relative z-10 mt-1 flex h-10 w-10 flex-none items-center justify-center rounded-full shadow-md ring-1 shadow-zinc-800/5 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
				<Image
					src={role.attributes.logo.data.attributes.url}
					alt={role.attributes.logo.data.attributes.caption}
					className="h-7 w-7"
					width={role.attributes.logo.data.attributes.width}
					height={role.attributes.logo.data.attributes.height}
				/>
			</div>
			<dl className="relative z-10 flex flex-auto flex-wrap gap-x-2">
				<dt className="sr-only">Role</dt>
				<dd className="w-full flex-none text-sm font-medium text-zinc-900 dark:text-zinc-100">
					{role.attributes.title}
				</dd>
				<dt className="sr-only">Company</dt>
				<dd className="text-xs text-zinc-500 dark:text-zinc-400">
					{role.attributes.company} | {role.attributes.place}
				</dd>
				<dt className="sr-only">Date</dt>
				<dd className="ml-auto text-xs text-zinc-500 dark:text-zinc-400">
					<time dateTime={role.attributes.start}>{role.attributes.start}</time>{" "}
					<span aria-hidden="true">—</span>{" "}
					<time dateTime={endDate}>{endLabel}</time>
				</dd>
			</dl>
		</li>
	);
};

export default Role;
