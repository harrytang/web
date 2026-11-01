import { InformationCircleIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

export default function BMC() {
	const bmcUrl = process.env.NEXT_PUBLIC_BMC_URL ?? "https://buymeacoffee.com";

	return (
		<div className="rounded-3xl bg-raised px-5 ring-1 ring-line">
			<div className="flex items-center">
				<div className="shrink-0">
					<InformationCircleIcon
						aria-hidden="true"
						className="h-5 w-5 text-accent"
					/>
				</div>
				<div className="ml-3 flex-1 md:flex md:justify-between">
					<p className="text-sm text-muted">
						If you found this useful, you can{" "}
						<Link
							href={bmcUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="text-amber-800 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300"
						>
							buy me a coffee
						</Link>
						! Thanks for the support!
					</p>
				</div>
			</div>
		</div>
	);
}
