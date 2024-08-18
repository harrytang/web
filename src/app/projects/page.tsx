import Image from 'next/image'
import { LinkIcon } from '@heroicons/react/20/solid'

// local imports
import { Card, CardLink, CardDescription } from '@/components/Card'
import { SimpleLayout } from '@/components/SimpleLayout'
import { getPage } from '@/lib/pages'
import { getProjects } from '@/lib/projects'
import { generateSeoMeta, generateWebPageJsonLd } from '@/lib/helper'

export async function generateMetadata() {
  const page = await getPage('projects')
  return generateSeoMeta(
    'projects',
    page.attributes.seo,
    'website',
    page.attributes.locale,
  )
}

const Projects = async () => {
  console.info('Rendering /projects page...')
  const page = await getPage('projects')
  const projects = await getProjects()
  const jsonld = generateWebPageJsonLd({
    name: page.attributes.title,
    description: page.attributes.seo.metaDescription,
  })

  return (
    <SimpleLayout
      subtitle={page.attributes.subtitle}
      content={page.attributes.content}
    >
      <ul
        role="list"
        className="grid grid-cols-1 gap-x-12 gap-y-16 sm:grid-cols-2 lg:grid-cols-3"
      >
        {projects.data.map((project) => (
          <Card as="li" key={project.attributes.name}>
            <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md shadow-zinc-800/5 ring-1 ring-zinc-900/5 dark:border dark:border-zinc-700/50 dark:bg-zinc-800 dark:ring-0">
              <Image
                src={project.attributes.icon.data.attributes.url}
                alt={project.attributes.name}
                className="h-8 w-8"
                width={project.attributes.icon.data.attributes.width}
                height={project.attributes.icon.data.attributes.height}
                unoptimized
              />
            </div>
            <h2 className="mt-6 text-base font-semibold text-zinc-800 dark:text-zinc-100">
              <CardLink href={project.attributes.link.href}>
                {project.attributes.name}
              </CardLink>
            </h2>
            <CardDescription>{project.attributes.description}</CardDescription>
            <p className="relative z-10 mt-6 flex text-sm font-medium text-zinc-400 transition group-hover:text-amber-500 dark:text-zinc-200">
              <LinkIcon className="h-6 w-6 flex-none" />
              <span className="ml-2">{project.attributes.link.label}</span>
            </p>
          </Card>
        ))}
      </ul>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonld) }}
      />
    </SimpleLayout>
  )
}

export default Projects
