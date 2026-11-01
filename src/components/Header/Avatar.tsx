import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type AvatarProps = Omit<ComponentPropsWithoutRef<typeof Link>, "href"> & {
	className?: string;
};

const Avatar: React.FC<AvatarProps> = ({ className, ...props }) => {
	const avatarUrl = process.env.NEXT_PUBLIC_AVATAR_URL ?? "";
	const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Site";

	return (
		<Link
			href="/"
			aria-label="Home"
			className={clsx(className, "block rounded-full")}
			as={"/"}
			{...props}
		>
			<Image
				src={avatarUrl}
				width="512"
				height="512"
				alt={siteName}
				sizes="2.5rem"
				className="size-10 rounded-full bg-surface object-cover ring-2 ring-accent/60 ring-offset-2 ring-offset-canvas"
				priority
			/>
		</Link>
	);
};

export default Avatar;
