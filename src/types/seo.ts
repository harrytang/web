import type { Media } from '@/types/media'

type MetaSocial = {
  id: number
  socialNetwork: string
  title: string
  description: string
  image: { data: Media }
}

type Seo = {
  id: number
  metaTitle: string
  metaDescription: string
  keywords: string
  metaRobots: string | null
  structuredData: string | null
  metaViewport: string | null
  canonicalURL: string | null
  metaImage: { data: Media }
  metaSocial: MetaSocial[]
}

export type { Seo }
