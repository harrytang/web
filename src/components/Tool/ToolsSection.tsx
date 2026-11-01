import { Section } from "../Section";

const ToolsSection = ({
	children,
	...props
}: React.ComponentPropsWithoutRef<typeof Section>) => {
	return (
		<Section {...props}>
			<ul className="grid gap-x-12 gap-y-12 lg:grid-cols-2">{children}</ul>
		</Section>
	);
};

export default ToolsSection;
