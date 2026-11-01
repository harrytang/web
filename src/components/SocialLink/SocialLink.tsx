import { ArrowUpRightIcon } from "@heroicons/react/20/solid";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import type { Media } from "@/types/media";

type SocialLinkProps = {
	className?: string;
	href: string;
	icon: Media;
	children: React.ReactNode;
};

const SocialLink: React.FC<SocialLinkProps> = ({
	className,
	href,
	children,
	icon,
}) => {
	return (
		<li className={clsx(className, "flex")}>
			<Link
				href={href}
				className="group flex w-full items-center gap-4 rounded-2xl bg-raised p-4 ring-1 ring-line transition hover:-translate-y-0.5 hover:ring-accent/40"
			>
				<span className="grid size-10 flex-none place-items-center rounded-xl bg-surface ring-1 ring-line">
					<Image
						src={icon.url}
						alt={icon.caption}
						className="size-5 object-contain"
						unoptimized
						width={icon.width}
						height={icon.height}
					/>
				</span>
				<span className="text-sm font-medium text-ink">{children}</span>
				<ArrowUpRightIcon
					aria-hidden="true"
					className="ml-auto size-4 flex-none text-muted transition group-hover:text-accent"
				/>
			</Link>
		</li>
	);
};

export default SocialLink;
