import clsx from "clsx";
import ReactMarkdown from "react-markdown";

type BiographyProps = {
	content: string;
	className?: string;
};

// Tailwind's reset removes all heading styling, so without these the section
// headings of the biography would read as plain body text.
const Biography: React.FC<BiographyProps> = ({ content, className }) => (
	<div
		className={clsx(
			"flex flex-col gap-6 text-lg/8 font-light text-pretty text-muted",
			className,
		)}
	>
		<ReactMarkdown
			components={{
				h2: ({ node, ...props }) => (
					<h2
						className="mt-6 text-sm font-semibold tracking-[0.2em] text-accent uppercase"
						{...props}
					/>
				),
				h3: ({ node, ...props }) => (
					<h3 className="mt-4 text-base font-semibold text-ink" {...props} />
				),
			}}
		>
			{content}
		</ReactMarkdown>
	</div>
);

export default Biography;
