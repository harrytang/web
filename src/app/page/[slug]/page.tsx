import { notFound } from "next/navigation";
import { SimpleLayout } from "@/components/SimpleLayout/";
import { generateSeoMeta, generateWebPageJsonLd } from "@/lib/helper";
import { getPage, getPageSlugs } from "@/lib/pages";

type PageProps = {
	params: Promise<{
		slug: string;
	}>;
};

const IGNORED = ["gear"];

export async function generateStaticParams() {
	const slugs = await getPageSlugs();

	// remove ignored slugs
	return slugs
		.filter((slug) => !IGNORED.includes(slug))
		.map((slug) => ({
			slug,
		}));
}

// NextJS feature: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
export async function generateMetadata({ params }: PageProps) {
	const { slug } = await params;
	console.info(`Rendering /page/${slug}`);
	const page = await getPage(slug);
	if (page && !IGNORED.includes(slug)) {
		return generateSeoMeta(`${slug}`, page.seo, "website", page.locale);
	}
}

const Page: React.FC<PageProps> = async ({ params }) => {
	const { slug } = await params;
	const page = await getPage(slug);
	if (!page || IGNORED.includes(slug)) {
		return notFound();
	}

	const jsonld = generateWebPageJsonLd({
		name: page.title,
		description: page.seo.metaDescription,
	});

	return (
		<SimpleLayout subtitle={page.subtitle} content={page.content}>
			<script type="application/ld+json">{JSON.stringify(jsonld)}</script>
		</SimpleLayout>
	);
};

export default Page;
