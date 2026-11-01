import { BriefcaseIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import { getWorks } from "@/lib/works";
import Role from "./Role";

const Work = async ({ className }: { className?: string } = {}) => {
	const works = await getWorks();

	return (
		<aside
			aria-labelledby="work-title"
			className={clsx(
				"rounded-3xl bg-raised p-8 shadow-2xl shadow-black/10 ring-1 ring-line xl:sticky xl:top-24 xl:max-h-[calc(100dvh-7rem)] xl:overflow-y-auto",
				className,
			)}
		>
			<h2
				id="work-title"
				className="flex items-center gap-3 text-sm font-semibold tracking-[0.2em] text-accent uppercase"
			>
				<BriefcaseIcon className="size-5 text-muted" />
				<span>Work</span>
			</h2>
			<ol className="mt-6 divide-y divide-line">
				{works.data.map((work) => (
					<Role key={work.id} role={work} />
				))}
			</ol>
		</aside>
	);
};

export default Work;
