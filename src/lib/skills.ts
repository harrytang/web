import { Media } from '@/types/media'
import { fetchAPI } from './hepler'

export interface Skill {
  id: number
  attributes: {
    name: string
    content: string
    image: {
      data: Media
    }
    createdAt: string
    updatedAt: string
    publishedAt: string
  }
}

export async function getSkill() {
  return fetchAPI<Skill[]>('/skills', {
    populate: ['image'],
    sort: 'publishedAt:desc',
  })
}
