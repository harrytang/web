import { Seo } from '@/types/seo'
import { fetchAPI } from './hepler'

export interface Page {
  id: number
  attributes: {
    title: string
    slug: string
    description: string
    seo: Seo
    locale: string
    createdAt: string
    updatedAt: string
    publishedAt: string
  }
}

export async function getPage(slug: string): Promise<Page> {
  const res = fetchAPI<Page[]>('/pages', {
    populate: [
      'seo',
      'seo.metaImage',
      'seo.metaSocial',
      'seo.metaSocial.image',
    ],
    filters: {
      slug: slug,
    },
  })
  return (await res).data[0]
}
