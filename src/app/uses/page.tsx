import { Card } from '@/components/Card'
import { Section } from '@/components/Section'
import { SimpleLayout } from '@/components/SimpleLayout'
import { generateSeoMeta } from '@/lib/hepler'
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
  const page = await getPage('uses')
  return generateSeoMeta(
    'uses',
    page.attributes.seo,
    'website',
    page.attributes.locale,
  )
}

export default async function Uses() {
  const page = await getPage('uses')
  const uses = await getUses()
  const categorizedUses = transformItems(uses.data)
  return (
    <SimpleLayout
      title={page.attributes.title}
      intro={page.attributes.description}
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
    </SimpleLayout>
  )
}
