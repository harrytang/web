import clsx from "clsx";
import { forwardRef } from "react";

const ContainerInner = forwardRef<
	React.ElementRef<"div">,
	React.ComponentPropsWithoutRef<"div">
>(function InnerContainer({ className, children, ...props }, ref) {
	return (
		<div ref={ref} className={clsx("relative", className)} {...props}>
			{children}
		</div>
	);
});

export default ContainerInner;
