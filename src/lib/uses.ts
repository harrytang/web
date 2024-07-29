import { Seo } from '@/types/seo'
import { fetchAPI } from './helper'

export interface Use {
  id: number
  attributes: {
    title: string
    description: string
    category: string
    createdAt: string
    updatedAt: string
    publishedAt: string
  }
}

export async function getUses() {
  return fetchAPI<Use[]>('/uses', {
    populate: [],
    sort: 'publishedAt:desc',
  })
}
