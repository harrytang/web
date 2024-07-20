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

export async function getBlog(slug: string) {
  const res = fetchAPI<Blog[]>('/blogs', {
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
  })
  return (await res).data[0]
}

export async function getBlogs(start?: number, limit?: number) {
  const res = fetchAPI<Blog[]>('/blogs', {
    populate: ['seo', 'seo.metaImage'],
    sort: 'publishedAt:desc',
    locale: 'all',
    pagination: {
      limit: limit ?? process.env.NEXT_PUBLIC_PAGE_SIZE,
      start: start ?? 0,
    },
  })
  return res
}
