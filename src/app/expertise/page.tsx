import Image from 'next/image'
// local imports
import { SimpleLayout } from '@/components/SimpleLayout'
import { getPage } from '@/lib/pages'
import { generateSeoMeta, generateWebPageJsonLd } from '@/lib/hepler'
import { listRandomSkill } from '@/lib/skills'

export const revalidate = 3600 // revalidate at most every hour

export async function generateMetadata() {
  const page = await getPage('expertise')
  return generateSeoMeta(
    'expertise',
    page.attributes.seo,
    'website',
    page.attributes.locale,
  )
}

export default async function Speaking() {
  const page = await getPage('expertise')
  const skills = await listRandomSkill()
  const jsonld = generateWebPageJsonLd({
    name: page.attributes.title,
    description: page.attributes.seo.metaDescription,
  })

  return (
    <SimpleLayout
      subtitle={page.attributes.subtitle}
      content={page.attributes.content}
    >
      <div className="">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {skills.map((skill) => (
              <div key={skill.attributes.name} className="sm:flex">
                <div className="flex items-center sm:flex-shrink-0">
                  <div className="flow-root">
                    <Image
                      src={skill.attributes.image.data.attributes.url}
                      alt={skill.attributes.name}
                      className="w-28"
                      width={skill.attributes.image.data.attributes.width}
                      height={skill.attributes.image.data.attributes.height}
                      unoptimized
                    />
                  </div>
                </div>
                <div className="mt-3 sm:ml-3 sm:mt-0">
                  <h3 className="text-sm font-medium">
                    {skill.attributes.name}
                  </h3>
                  <p className="mt-2 text-justify text-sm text-gray-500">
                    {skill.attributes.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }}
      />
    </SimpleLayout>
  )
}