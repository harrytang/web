import { Seo } from '@/types/seo'
import { fetchAPI } from './strapi'

export interface Page {
  id: number
  attributes: {
    slug: string
    title: string
    subtitle: string
    content: string
    seo: Seo
    locale: string
    createdAt: string
    updatedAt: string
    publishedAt: string
  }
}

const getPage = async (slug: string): Promise<Page> => {
  const res = fetchAPI<Page[]>(
    '/pages',
    {
      populate: [
        'seo',
        'seo.metaImage',
        'seo.metaSocial',
        'seo.metaSocial.image',
      ],
      filters: {
        slug: slug,
      },
    },
    {
      next: { tags: [`page-${slug}`] },
    },
  )
  return (await res).data[0]
}

const getPageSlugs = async () => {
  let allSlugs: string[] = []
  let start = 0
  const limit = process.env.SITEMAP_SIZE
    ? parseInt(process.env.SITEMAP_SIZE)
    : 1000
  let hasMore = true

  while (hasMore) {
    const res = await fetchAPI<Page[]>('/pages', {
      locale: 'all',
      pagination: { limit, start },
    })

    // Extract slugs from the response
    const slugs = res.data.map((page) => page.attributes.slug)
    allSlugs = allSlugs.concat(slugs)

    // Check if there are more blogs to fetch
    const total = res.meta.pagination.total
    start += limit
    hasMore = start < total
  }

  return allSlugs
}

export { getPage, getPageSlugs }
