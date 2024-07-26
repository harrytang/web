import SimpleLayout from '@/components/SimpleLayout/'
import { generateSeoMeta, generateWebPageJsonLd } from '@/lib/hepler'
import { getPage, getPageSlugs } from '@/lib/pages'
import notFound from '@/app/not-found'

type Params = {
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
export async function generateMetadata({ params }: Params) {
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

export default async function Page({ params }: Params) {
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
