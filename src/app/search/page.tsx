import { CSE } from "@/components/CSE";
import { SimpleLayout } from "@/components/SimpleLayout";

const Page = async () => {
	console.info(`Rendering /search`);
	return (
		<SimpleLayout subtitle="Search articles" seachBox={true}>
			<div className="relative rounded-3xl bg-raised p-6 ring-1 ring-line lg:p-8">
				<CSE type="searchresults" />
			</div>
		</SimpleLayout>
	);
};

export default Page;
