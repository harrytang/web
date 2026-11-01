import { forwardRef } from "react";

// Same gutters as the header and footer, so page content lines up with them.
const ContainerOuter = forwardRef<
	React.ElementRef<"div">,
	React.ComponentPropsWithoutRef<"div">
>(function OuterContainer({ className, children, ...props }, ref) {
	return (
		<div ref={ref} className={className} {...props}>
			<div className="mx-auto w-full max-w-7xl px-6 lg:px-8">{children}</div>
		</div>
	);
});

export default ContainerOuter;
