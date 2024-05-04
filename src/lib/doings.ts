import { Seo } from '@/types/seo'
import { fetchAPI } from './hepler'

export interface Doing {
  id: number
  attributes: {
    title: string
    description: string
    category: string
    subtitle: string
    createdAt: string
    updatedAt: string
    publishedAt: string
  }
}

export async function getDoings() {
  return fetchAPI<Doing[]>('/doings', {
    populate: [],
    sort: 'publishedAt:desc',
  })
}
