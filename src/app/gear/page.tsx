import SimpleLayout from '@/components/SimpleLayout/SimpleLayout'
import { Tool, ToolsSection } from '@/components/Tool'
import {
  categorizeItems,
  generateSeoMeta,
  generateWebPageJsonLd,
} from '@/lib/helper'
import { getPage } from '@/lib/pages'
import { Use, getUses } from '@/lib/uses'

export async function generateMetadata() {
  const page = await getPage('gear')
  return generateSeoMeta(
    'gear',
    page.attributes.seo,
    'website',
    page.attributes.locale,
  )
}

const Gear = async () => {
  console.info('Rendering /gear page...')
  const page = await getPage('gear')
  const uses = await getUses()
  const categorizedUses = categorizeItems(uses.data)
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
export default Gear
