import { Card } from '@/components/Card'
import { Section } from '@/components/Section'
import { SimpleLayout } from '@/components/SimpleLayout'
import { generateSeoMeta, generateWebPageJsonLd } from '@/lib/hepler'
import { getPage } from '@/lib/pages'
import { Use, getUses } from '@/lib/uses'

function ToolsSection({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Section>) {
  return (
    <Section {...props}>
      <ul role="list" className="space-y-16">
        {children}
      </ul>
    </Section>
  )
}

function Tool({
  title,
  href,
  children,
}: {
  title: string
  href?: string
  children: React.ReactNode
}) {
  return (
    <Card as="li">
      <Card.Title as="h3" href={href}>
        {title}
      </Card.Title>
      <Card.Description>{children}</Card.Description>
    </Card>
  )
}

function transformItems(items: Use[]) {
  const categoryMap: { [key: string]: Use[] } = {}

  // Group items by category
  items.forEach((item) => {
    const { category } = item.attributes
    if (!categoryMap[category]) {
      categoryMap[category] = []
    }
    categoryMap[category].push(item)
  })

  return categoryMap
}

export async function generateMetadata() {
  const page = await getPage('gear')
  return generateSeoMeta(
    'gear',
    page.attributes.seo,
    'website',
    page.attributes.locale,
  )
}

export default async function Gear() {
  console.info('Rendering /gear page...')
  const page = await getPage('gear')
  const uses = await getUses()
  const categorizedUses = transformItems(uses.data)
  const jsonld = generateWebPageJsonLd({
    name: page.attributes.title,
    description: page.attributes.seo.metaDescription,
  })
  return (
    <SimpleLayout
      subtitle={page.attributes.subtitle}
      content={page.attributes.content}
    >
      <div className="space-y-20">
        {Object.entries(categorizedUses).map(([category, items]) => (
          <ToolsSection key={category} title={category}>
            {items.map((use: Use) => (
              <Tool key={use.id} title={use.attributes.title}>
                {use.attributes.description}
              </Tool>
            ))}
          </ToolsSection>
        ))}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }}
      />
    </SimpleLayout>
  )
}
