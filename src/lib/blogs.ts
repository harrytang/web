import { Seo } from '@/types/seo'
import { fetchAPI, getAllEntitySlugs } from './strapi'

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
  return getAllEntitySlugs('blogs')
}

export { getBlog, getBlogs, getBlogSlugs }
