import { fetchAPI } from './hepler'
import { Media } from '@/types/media'

export interface Project {
  id: number
  attributes: {
    name: string
    description: string
    createdAt: string
    updatedAt: string
    publishedAt: string
    icon: {
      data: Media
    }
    link: {
      href: string
      label: string
    }
  }
}

export async function getProjects() {
  return fetchAPI<Project[]>('/projects', {
    populate: ['icon', 'link'],
    sort: 'publishedAt:desc',
  })
}
