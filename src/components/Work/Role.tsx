import Image from "next/image";
import Link from "next/link";
import type { Work } from "@/lib/works";

const Role = ({ role }: { role: Work }) => {
	const endLabel = role.end ?? "Present";
	const endDate = role.end ?? new Date().getFullYear().toString();
	const roleUrl = role.url?.href;
	const roleLinkLabel = role.url?.label || role.company;
	const isInternalUrl = roleUrl?.startsWith("/");

	return (
		<li className="group relative grid grid-cols-[2.75rem_1fr] items-start gap-x-4 py-5 first:pt-0 last:pb-0">
			{roleUrl ? (
				<>
					<div className="absolute -inset-x-3 inset-y-1 z-0 rounded-2xl bg-surface opacity-0 transition group-hover:opacity-100" />
					{isInternalUrl ? (
						<Link
							className="absolute -inset-x-3 inset-y-1 z-20 rounded-2xl"
							href={roleUrl}
							aria-label={`Visit ${roleLinkLabel}`}
						>
							<span className="sr-only">Visit {roleLinkLabel}</span>
						</Link>
					) : (
						<a
							className="absolute -inset-x-3 inset-y-1 z-20 rounded-2xl"
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
			<div className="relative z-10 grid size-11 place-items-center rounded-xl bg-white ring-1 ring-ink/10">
				<Image
					src={role.logo.url}
					alt={role.logo.caption}
					className="size-7 object-contain"
					width={role.logo.width}
					height={role.logo.height}
				/>
			</div>
			<dl className="relative z-10 grid min-w-0 gap-y-0.5 sm:grid-cols-[1fr_auto] sm:gap-x-4">
				<dt className="sr-only">Role</dt>
				<dd className="text-base/6 font-medium break-words text-ink">
					{role.title}
				</dd>
				<dt className="sr-only">Company</dt>
				<dd className="text-sm text-muted">
					{role.company} | {role.place}
				</dd>
				<dt className="sr-only">Date</dt>
				<dd className="text-sm whitespace-nowrap tabular-nums text-muted sm:col-start-2 sm:row-start-1">
					<time dateTime={role.start}>{role.start}</time>{" "}
					<span aria-hidden="true">—</span>{" "}
					<time dateTime={endDate}>{endLabel}</time>
				</dd>
			</dl>
		</li>
	);
};

export default Role;
