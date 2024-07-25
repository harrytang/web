import { Seo } from '@/types/seo'
import { fetchAPI } from './hepler'

export interface Blog {
  id: number
  attributes: {
    title: string
    slug: string
    content: string
    mediaUrl?: string
    locale: string
    seo: Seo
    createdAt: string
    updatedAt: string
    publishedAt: string
  }
}

const getBlog = async (slug: string) => {
  const res = fetchAPI<Blog[]>(
    '/blogs',
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
      locale: 'all',
    },
    {
      next: { tags: [`blog-${slug}`] },
    },
  )
  return (await res).data[0]
}

const getBlogs = async (start?: number, limit?: number) => {
  return await fetchAPI<Blog[]>('/blogs', {
    populate: ['seo', 'seo.metaImage'],
    sort: 'publishedAt:desc',
    locale: 'all',
    pagination: {
      limit: limit ?? process.env.NEXT_PUBLIC_PAGE_SIZE,
      start: start ?? 0,
    },
  })
}

const getBlogSlugs = async () => {
  let allSlugs: string[] = []
  let start = 0
  const limit = process.env.SITEMAP_SIZE
    ? parseInt(process.env.SITEMAP_SIZE)
    : 1000
  let hasMore = true

  while (hasMore) {
    const res = await fetchAPI<Blog[]>('/blogs', {
      locale: 'all',
      pagination: { limit, start },
    })

    // Extract blog slugs from the response
    const slugs = res.data.map((blog) => blog.attributes.slug)
    allSlugs = allSlugs.concat(slugs)

    // Check if there are more blogs to fetch
    const total = res.meta.pagination.total
    start += limit
    hasMore = start < total
  }

  return allSlugs
}

export { getBlog, getBlogs, getBlogSlugs }
