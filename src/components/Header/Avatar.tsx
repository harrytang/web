import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type AvatarProps = Omit<ComponentPropsWithoutRef<typeof Link>, "href"> & {
	large?: boolean;
	className?: string;
};

const Avatar: React.FC<AvatarProps> = ({
	large = false,
	className,
	...props
}) => {
	const avatarUrl = process.env.NEXT_PUBLIC_AVATAR_URL ?? "";
	const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "Site";

	return (
		<Link
			href="/"
			aria-label="Home"
			className={clsx(className, "pointer-events-auto")}
			as={"/"}
			{...props}
		>
			<Image
				src={avatarUrl}
				width="512"
				height="512"
				alt={siteName}
				sizes={large ? "4rem" : "2.25rem"}
				className={clsx(
					"rounded-full bg-zinc-100 object-cover dark:bg-zinc-800",
					large ? "h-16 w-16" : "h-9 w-9",
				)}
				priority
			/>
		</Link>
	);
};

export default Avatar;
