import { type Metadata } from 'next'

import { Card } from '@/components/Card'
import { Section } from '@/components/Section'
import { SimpleLayout } from '@/components/SimpleLayout'
import { getPage } from '@/lib/pages'
import { generateSeoMeta } from '@/lib/hepler'
import { Doing, getDoings } from '@/lib/doings'

function SpeakingSection({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof Section>) {
  return (
    <Section {...props}>
      <div className="space-y-16">{children}</div>
    </Section>
  )
}

function Appearance({
  title,
  description,
  event,
  // cta,
  // href,
}: {
  title: string
  description: string
  event: string
  // cta: string
  // href: string
}) {
  return (
    <Card as="article">
      <Card.Title as="h3">{title}</Card.Title>
      <Card.Eyebrow decorate>{event}</Card.Eyebrow>
      <Card.Description>{description}</Card.Description>
      {/* <Card.Cta>{cta}</Card.Cta> */}
    </Card>
  )
}

function transformItems(items: Doing[]) {
  const categoryMap: { [key: string]: Doing[] } = {}

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
  const page = await getPage('expertise')
  return generateSeoMeta(
    'uses',
    page.attributes.seo,
    'website',
    page.attributes.locale,
  )
}

export default async function Speaking() {
  const page = await getPage('expertise')
  const doings = await getDoings()
  const categorizedDoings = transformItems(doings.data)
  return (
    <SimpleLayout
      title={page.attributes.title}
      intro={page.attributes.description}
    >
      <div className="space-y-20">
        {Object.entries(categorizedDoings).map(([category, items]) => (
          <SpeakingSection key={category} title={category}>
            {items.map((doing: Doing) => (
              <Appearance
                key={doing.id}
                title={doing.attributes.title}
                description={doing.attributes.description}
                event={doing.attributes.subtitle}
                // cta="Watch video"
                // href="#"
              />
            ))}
          </SpeakingSection>
        ))}
      </div>
    </SimpleLayout>
  )
}
