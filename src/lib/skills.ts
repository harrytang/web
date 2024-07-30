import { Media } from '@/types/media'
import { fetchAPI } from './strapi'

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

export async function listRandomSkill() {
  const skills = await fetchAPI<Skill[]>('/skills', {
    populate: ['image'],
  })
  // randomize the order of the skills
  return skills.data.sort(() => Math.random() - 0.5)
}
