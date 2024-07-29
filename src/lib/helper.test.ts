import { Seo } from '@/types/seo'
import {
  categorizeItems,
  clamp,
  fetchAPI,
  formatDate,
  generatePersonJsonLd,
  generateSeoMeta,
  generateWebPageJsonLd,
  getPublicSiteURL,
  getStrapiURL,
} from './helper'
import { Use } from './uses'
import { Profile } from './profile'
// test data
import usesJson from './../../__test__/fixtures/uses.json'
import profileJson from './../../__test__/fixtures/profile.json'

describe('getStrapiURL', () => {
  it('should return the server-side URL when window is undefined', () => {
    if ('window' in global) {
      delete (global as any).window
    }
    process.env.STRAPI_API_URL = 'http://localhost:1337'
    expect(getStrapiURL('/path')).toBe('http://localhost:1337/path')
  })

  it('should return the client-side URL when window is defined', () => {
    global.window = {} as any
    process.env.NEXT_PUBLIC_STRAPI_API_URL = 'http://localhost:1338'
    expect(getStrapiURL('/path')).toBe('http://localhost:1338/path')
  })
})

// describe('fetchAPI', () => {
//   beforeEach(() => {
//     ;(fetch as jest.Mock).mockClear()
//   })

//   it('should fetch data from the correct URL with default options', async () => {
//     process.env.STRAPI_API_URL = 'http://localhost:1337'
//     const mockResponse = {
//       data: {},
//       meta: { pagination: { start: 0, limit: 10, total: 1 } },
//     }
//     ;(fetch as jest.Mock).mockResolvedValue({
//       ok: true,
//       json: async () => mockResponse,
//     })

//     const result = await fetchAPI('/test-path')
//     expect(fetch).toHaveBeenCalledWith(
//       'http://localhost:1337/api/test-path',
//       expect.objectContaining({
//         headers: { 'Content-Type': 'application/json' },
//         cache: 'force-cache',
//       }),
//     )
//     expect(result).toEqual(mockResponse)
//   })

//   it('should throw an error when response is not ok', async () => {
//     ;(fetch as jest.Mock).mockResolvedValue({
//       ok: false,
//       statusText: 'Not Found',
//     })
//     await expect(fetchAPI('/test-path')).rejects.toThrow(
//       'An error occurred please try again',
//     )
//   })
// })

describe('getPublicSiteURL', () => {
  // it('should return the default URL when NEXT_PUBLIC_SITE_URL is not set', () => {
  //   process.env.NEXT_PUBLIC_SITE_URL = undefined
  //   expect(getPublicSiteURL()).toBe('http://localhost:3000')
  // })

  it('should return the custom URL when NEXT_PUBLIC_SITE_URL is set', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com'
    expect(getPublicSiteURL()).toBe('https://example.com')
  })

  it('should return the default URL when NEXT_PUBLIC_SITE_URL is an empty string', () => {
    process.env.NEXT_PUBLIC_SITE_URL = ''
    expect(getPublicSiteURL()).toBe('http://localhost:3000')
  })

  // it('should return the default URL when NEXT_PUBLIC_SITE_URL is not a string', () => {
  //   ;(process.env.NEXT_PUBLIC_SITE_URL as any) = 12345
  //   expect(getPublicSiteURL()).toBe('http://localhost:3000')
  // })
})

describe('generateSeoMeta', () => {
  it('should generate SEO metadata correctly', () => {
    process.env.NEXT_PUBLIC_SITE_NAME = 'Test Site'
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'

    const seo: Seo = {
      metaTitle: 'Test Title',
      metaDescription: 'Test Description',
      keywords: 'test, example',
      canonicalURL: 'http://localhost:3000/test',
      metaImage: {
        data: {
          attributes: {
            name: 'Test',
            alternativeText: 'Test',
            caption: 'Test',
            url: 'http://localhost:3000/image.jpg',
            width: 1200,
            height: 630,
            formats: {
              large: undefined,
              medium: undefined,
              small: undefined,
              thumbnail: undefined,
            },
            hash: '',
            ext: '',
            mime: '',
            size: 0,
            previewUrl: null,
            provider: '',
            provider_metadata: null,
            createdAt: '',
            updatedAt: '',
          },
          id: 1,
        },
      },
      metaSocial: [
        {
          socialNetwork: 'Facebook',
          title: 'FB Title',
          description: 'FB Description',
          image: {
            data: {
              attributes: {
                url: 'http://localhost:3000/fb-image.jpg',
                width: 1200,
                height: 630,
                name: '',
                alternativeText: '',
                caption: '',
                formats: {
                  large: undefined,
                  medium: undefined,
                  small: undefined,
                  thumbnail: undefined,
                },
                hash: '',
                ext: '',
                mime: '',
                size: 0,
                previewUrl: null,
                provider: '',
                provider_metadata: null,
                createdAt: '',
                updatedAt: '',
              },
              id: 0,
            },
          },
          id: 0,
        },
      ],
      id: 0,
      metaRobots: null,
      structuredData: null,
      metaViewport: null,
    }

    const result = generateSeoMeta('test-path', seo, 'website', 'en')
    expect(result).toEqual(
      expect.objectContaining({
        title: 'Test Title',
        description: 'Test Description',
        keywords: 'test, example',
      }),
    )
  })
})

describe('clamp', () => {
  it('should return the number if it is within the range', () => {
    expect(clamp(5, 1, 10)).toBe(5)
  })

  it('should return the lower bound if the number is below the range', () => {
    expect(clamp(-5, 1, 10)).toBe(1)
  })

  it('should return the upper bound if the number is above the range', () => {
    expect(clamp(15, 1, 10)).toBe(10)
  })
})

describe('categorizeItems', () => {
  it('should group items by category', () => {
    const items: Use[] = usesJson.data

    const result = categorizeItems(items)
    expect(result).toEqual({
      Workstation: [
        {
          attributes: {
            title: 'MacBook Pro',
            description:
              'My 16” MacBook Pro with M1 Max chip and 64GB RAM (2021) offers exceptional performance and efficiency, making it an essential tool for software development and everyday tasks.',
            category: 'Workstation',
            createdAt: '2024-04-01T15:50:12.467Z',
            updatedAt: '2024-07-13T15:11:22.000Z',
            publishedAt: '2024-04-01T15:50:14.274Z',
          },
          id: 9,
        },
      ],
      Development: [
        {
          attributes: {
            title: 'DataGrip',
            description:
              'JetBrains DataGrip is a powerful database management tool that provides advanced features for efficient data handling, SQL development, and database administration, enhancing productivity for developers and data professionals.',
            category: 'Development',
            createdAt: '2024-04-01T15:52:11.246Z',
            updatedAt: '2024-07-13T15:22:19.872Z',
            publishedAt: '2024-04-01T15:52:14.963Z',
          },
          id: 10,
        },
      ],
    })
  })
})

describe('formatDate', () => {
  it('should format the date correctly', () => {
    const dateString = '2021-07-28T00:00:00.000Z'
    expect(formatDate(dateString)).toBe('28 July 2021')
  })
})

describe('JSON-LD Generators', () => {
  it('should generate WebPage JSON-LD correctly', () => {
    const publicSiteUrl = getPublicSiteURL()
    const result = generateWebPageJsonLd({
      name: 'Test Page',
      description: 'Test Description',
    })
    expect(result).toEqual(
      expect.objectContaining({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Test Page',
        description: 'Test Description',
        publisher: {
          '@type': 'Person',
          name: process.env.NEXT_PUBLIC_SITE_NAME!,
          url: publicSiteUrl,
        },
      }),
    )
  })

  it('should generate Person JSON-LD correctly', () => {
    const profile = profileJson.data as Profile
    const publicSiteUrl = getPublicSiteURL()
    const result = generatePersonJsonLd(profile)
    expect(result).toEqual(
      expect.objectContaining({
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: process.env.NEXT_PUBLIC_SITE_NAME,
        image: profile.attributes.portraitPhoto.data.attributes.url,
        jobTitle: profile.attributes.title,
        url: publicSiteUrl,
        sameAs: profile.attributes.socials.map((link) => link.href),
      }),
    )
  })
})
