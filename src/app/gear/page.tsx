import SimpleLayout from "@/components/SimpleLayout/SimpleLayout";
import { Tool, ToolsSection } from "@/components/Tool";
import {
	categorizeItems,
	generateSeoMeta,
	generateWebPageJsonLd,
} from "@/lib/helper";
import { getPage } from "@/lib/pages";
import { getUses, type Use } from "@/lib/uses";

export async function generateMetadata() {
	const page = await getPage("gear");
	return generateSeoMeta("gear", page.seo, "website", page.locale);
}

const Gear = async () => {
	console.info("Rendering /gear");
	const page = await getPage("gear");
	const uses = await getUses();
	const categorizedUses = categorizeItems(uses.data);
	const jsonld = generateWebPageJsonLd({
		name: page.title,
		description: page.seo.metaDescription,
	});
	return (
		<SimpleLayout subtitle={page.subtitle} content={page.content}>
			<div className="space-y-20">
				{Object.entries(categorizedUses).map(([category, items]) => (
					<ToolsSection key={category} title={category}>
						{items.map((use: Use) => (
							<Tool key={use.id} title={use.title}>
								{use.description}
							</Tool>
						))}
					</ToolsSection>
				))}
			</div>
			<script type="application/ld+json">{JSON.stringify(jsonld)}</script>
		</SimpleLayout>
	);
};
export default Gear;
