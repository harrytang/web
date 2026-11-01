import { useId } from "react";

type SectionProps = {
	title: string;
	children: React.ReactNode;
};

const Section: React.FC<SectionProps> = ({ title, children }) => {
	const id = useId();

	return (
		<section
			aria-labelledby={id}
			className="rounded-3xl bg-raised p-6 ring-1 ring-line sm:p-8"
		>
			<div className="grid grid-cols-1 items-baseline gap-y-8 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-x-8">
				<h2
					id={id}
					className="text-sm font-semibold tracking-[0.2em] text-accent uppercase"
				>
					{title}
				</h2>
				<div>{children}</div>
			</div>
		</section>
	);
};

export default Section;
