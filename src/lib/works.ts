import { fetchAPI } from './strapi'
import { Media } from '@/types/media'

export interface Work {
  id: number
  attributes: {
    company: string
    title: string
    logo: {
      data: Media
    }
    place: string
    start: string
    end: string | null
  }
}

export async function getWorks() {
  const res = fetchAPI<Work[]>('/works', {
    populate: ['logo'],
    sort: 'start:DESC',
  })
  return res
}
