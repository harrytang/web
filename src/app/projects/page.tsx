import { LinkIcon } from "@heroicons/react/20/solid";
import Image from "next/image";

// local imports
import { Card, CardDescription, CardLink } from "@/components/Card";
import { SimpleLayout } from "@/components/SimpleLayout";
import { generateSeoMeta, generateWebPageJsonLd } from "@/lib/helper";
import { getPage } from "@/lib/pages";
import { getProjects } from "@/lib/projects";

export async function generateMetadata() {
	const page = await getPage("projects");
	return generateSeoMeta("projects", page.seo, "website", page.locale);
}

const Projects = async () => {
	console.info("Rendering /projects");
	const page = await getPage("projects");
	const projects = await getProjects();
	const jsonld = generateWebPageJsonLd({
		name: page.title,
		description: page.seo.metaDescription,
	});

	return (
		<SimpleLayout subtitle={page.subtitle} content={page.content}>
			<ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{projects.data.map((project) => (
					<Card
						as="li"
						key={project.name}
						className="rounded-3xl bg-raised p-7 ring-1 ring-line transition duration-300 hover:-translate-y-0.5 hover:ring-accent/40"
					>
						<div className="relative z-10 grid size-12 place-items-center rounded-xl bg-white ring-1 ring-ink/10">
							<Image
								src={project.icon.url}
								alt={project.name}
								className="size-8 object-contain"
								width={project.icon.width}
								height={project.icon.height}
								unoptimized
							/>
						</div>
						<h2 className="mt-6 text-lg font-semibold tracking-tight text-ink">
							<CardLink href={project.link.href}>{project.name}</CardLink>
						</h2>
						<CardDescription>{project.description}</CardDescription>
						<p className="relative z-10 mt-6 flex items-center text-sm font-medium text-accent transition">
							<LinkIcon className="size-5 flex-none" />
							<span className="ml-2">{project.link.label}</span>
						</p>
					</Card>
				))}
			</ul>

			<script type="application/ld+json">{JSON.stringify(jsonld)}</script>
		</SimpleLayout>
	);
};

export default Projects;
