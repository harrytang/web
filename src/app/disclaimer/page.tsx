import { SimpleLayout } from '@/components/SimpleLayout'
import { generateSeoMeta } from '@/lib/hepler'
import { getPage } from '@/lib/pages'

export async function generateMetadata() {
  const page = await getPage('disclaimer')
  return generateSeoMeta(
    'disclaimer',
    page.attributes.seo,
    'website',
    page.attributes.locale,
  )
}

export default async function Page() {
  const page = await getPage('disclaimer')
  return (
    <SimpleLayout
      description={page.attributes.description}
      content={page.attributes.content}
    />
  )
}
