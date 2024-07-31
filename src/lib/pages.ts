import { Seo } from '@/types/seo'
import { fetchAPI, getAllEntitySlugs } from './strapi'

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
  return getAllEntitySlugs('pages')
}

export { getPage, getPageSlugs }
