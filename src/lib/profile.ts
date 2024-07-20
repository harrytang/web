import { Seo } from '@/types/seo'
import { fetchAPI } from './hepler'
import { Media } from '@/types/media'
import { SocialLink } from '@/types/socialLink'

export interface Profile {
  id: number
  attributes: {
    title: string
    welcome: string
    about: string
    biography: string
    photos: {
      data: Media[]
    }
    portraitPhoto: {
      data: Media
    }
    seo: Seo
    socials: SocialLink[]
    createdAt: string
    updatedAt: string
    publishedAt: string
  }
}

export async function getProfile() {
  const res = fetchAPI<Profile>('/profile', {
    populate: [
      'photos',
      'seo',
      'seo.metaImage',
      'seo.metaSocial',
      'seo.metaSocial.image',
      'socials',
      'socials.icon',
      'portraitPhoto',
    ],
  })
  return res
}
