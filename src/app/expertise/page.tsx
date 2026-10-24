import Image from "next/image";
// local imports
import { SimpleLayout } from "@/components/SimpleLayout";
import { generateSeoMeta, generateWebPageJsonLd } from "@/lib/helper";
import { getPage } from "@/lib/pages";
import { listRandomSkill } from "@/lib/skills";

export const revalidate = 3600; // revalidate at most every hour

export async function generateMetadata() {
	const page = await getPage("expertise");
	return generateSeoMeta("expertise", page.seo, "website", page.locale);
}

const Expertise = async () => {
	console.info("Rendering /expertise");
	const page = await getPage("expertise");
	const skills = await listRandomSkill();

	const jsonld = generateWebPageJsonLd({
		name: page.title,
		description: page.seo.metaDescription,
	});

	return (
		<SimpleLayout subtitle={page.subtitle} content={page.content}>
			<div className="">
				<div className="mx-auto max-w-7xl">
					<div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
						{skills.map((skill) => (
							<div key={skill.name} className="sm:flex">
								<div className="flex items-center sm:shrink-0">
									<div className="flow-root">
										<Image
											src={skill.image.url}
											alt={skill.name}
											className="w-28"
											width={skill.image.width}
											height={skill.image.height}
											unoptimized
										/>
									</div>
								</div>
								<div className="mt-3 sm:ml-3 sm:mt-0">
									<h2 className="text-sm font-medium">{skill.name}</h2>
									<p className="mt-2 text-justify text-sm text-gray-500">
										{skill.content}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
			<script type="application/ld+json">{JSON.stringify(jsonld)}</script>
		</SimpleLayout>
	);
};

export default Expertise;
