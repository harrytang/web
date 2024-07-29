import { SimpleLayout } from '@/components/SimpleLayout/'
import { generateSeoMeta, generateWebPageJsonLd } from '@/lib/helper'
import { getPage, getPageSlugs } from '@/lib/pages'
import notFound from '@/app/not-found'

type PageProps = {
  params: {
    slug: string
  }
}

const IGNORED = ['gear']

export async function generateStaticParams() {
  const slugs = await getPageSlugs()

  // remove ignored slugs
  return slugs
    .filter((slug) => !IGNORED.includes(slug))
    .map((slug) => ({
      slug,
    }))
}

// NextJS feature: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
export async function generateMetadata({ params }: PageProps) {
  const page = await getPage(params.slug)
  if (page && !IGNORED.includes(params.slug)) {
    return generateSeoMeta(
      `${params.slug}`,
      page.attributes.seo,
      'website',
      page.attributes.locale,
    )
  }
}

const Page: React.FC<PageProps> = async ({ params }) => {
  console.info(`Rendering /${params.slug} page...`)
  const page = await getPage(params.slug)
  if (!page || IGNORED.includes(params.slug)) {
    return notFound()
  }

  const jsonld = generateWebPageJsonLd({
    name: page.attributes.title,
    description: page.attributes.seo.metaDescription,
  })

  return (
    <SimpleLayout
      subtitle={page.attributes.subtitle}
      content={page.attributes.content}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }}
      />
    </SimpleLayout>
  )
}

export default Page
