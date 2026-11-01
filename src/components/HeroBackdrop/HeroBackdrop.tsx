import { useId } from "react";

/**
 * Decorative hero background: a faded grid and a soft accent glow.
 * Purely visual, so it is hidden from assistive technology.
 */
const HeroBackdrop: React.FC = () => {
	const patternId = `grid-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;

	return (
		<>
			<svg
				aria-hidden="true"
				className="absolute inset-x-0 top-0 -z-10 h-184 w-full mask-[radial-gradient(40rem_30rem_at_70%_30%,white,transparent)] stroke-line"
			>
				<defs>
					<pattern
						id={patternId}
						width="56"
						height="56"
						x="50%"
						y="-1"
						patternUnits="userSpaceOnUse"
					>
						<path d="M.5 56V.5H56" fill="none" />
					</pattern>
				</defs>
				<rect
					width="100%"
					height="100%"
					fill={`url(#${patternId})`}
					strokeWidth="0"
				/>
			</svg>
			<div
				aria-hidden="true"
				className="absolute -top-24 right-[8%] -z-10 h-144 w-176 max-w-full bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--accent)_10%,transparent),transparent)] dark:bg-[radial-gradient(closest-side,color-mix(in_srgb,var(--accent)_20%,transparent),transparent)]"
			/>
			<div
				aria-hidden="true"
				className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-linear-to-b from-transparent to-canvas"
			/>
		</>
	);
};

export default HeroBackdrop;
