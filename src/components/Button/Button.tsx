import clsx from "clsx";
import Link from "next/link";

const variantStyles = {
	primary:
		"bg-accent font-semibold text-canvas hover:brightness-110 active:brightness-95",
	secondary:
		"bg-raised font-medium text-ink ring-1 ring-line hover:ring-accent/40 active:text-ink/70",
};

type ButtonProps = {
	variant?: keyof typeof variantStyles;
} & (
	| (React.ComponentPropsWithoutRef<"button"> & { href?: undefined })
	| React.ComponentPropsWithoutRef<typeof Link>
);

const Button: React.FC<ButtonProps> = ({
	variant = "primary",
	className,
	...props
}) => {
	className = clsx(
		"inline-flex items-center gap-2 justify-center rounded-md py-2 px-3 text-sm outline-offset-2 transition focus-visible:outline-2 focus-visible:outline-amber-600 active:transition-none disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:outline-amber-400",
		variantStyles[variant],
		className,
	);

	return typeof props.href === "undefined" ? (
		<button className={className} {...props} />
	) : (
		<Link className={className} {...props} />
	);
};

export default Button;
