import { CSE } from "@/components/CSE";
import { SimpleLayout } from "@/components/SimpleLayout";

const Page = async () => {
	console.info(`Rendering /search`);
	return (
		<SimpleLayout seachBox={true}>
			<h1 className="sr-only">Search articles</h1>
			<div className="relative bg-zinc-100 px-6 py-16 lg:px-8 dark:bg-zinc-800/50">
				<CSE type="searchresults" />
			</div>
		</SimpleLayout>
	);
};

export default Page;
