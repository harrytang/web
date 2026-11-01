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
					<div className="mx-auto grid max-w-2xl grid-cols-1 gap-6 lg:max-w-none lg:grid-cols-2">
						{skills.map((skill) => (
							<div
								key={skill.name}
								className="rounded-3xl bg-raised p-6 ring-1 ring-line sm:flex sm:p-7"
							>
								<div className="flex items-center sm:shrink-0">
									<div className="flow-root">
										<Image
											src={skill.image.url}
											alt={skill.name}
											className="size-24 object-contain"
											width={skill.image.width}
											height={skill.image.height}
											unoptimized
										/>
									</div>
								</div>
								<div className="mt-3 sm:ml-5 sm:mt-0">
									<h2 className="text-lg font-semibold text-ink">
										{skill.name}
									</h2>
									<p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
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
