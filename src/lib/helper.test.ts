import { Seo } from '@/types/seo'
import {
  categorizeItems,
  clamp,
  formatDate,
  generateArticleJsonLd,
  generateListArticleJsonLd,
  generatePersonJsonLd,
  generateProfilePageJsonLd,
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
import blogJson from './../../__test__/fixtures/blog.json'
import blogsJson from './../../__test__/fixtures/blogs.json'

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

describe('getPublicSiteURL', () => {
  it('should return the custom URL when NEXT_PUBLIC_SITE_URL is set', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com'
    expect(getPublicSiteURL()).toBe('https://example.com')
  })

  it('should return the default URL when NEXT_PUBLIC_SITE_URL is an empty string', () => {
    process.env.NEXT_PUBLIC_SITE_URL = ''
    expect(getPublicSiteURL()).toBe('http://localhost:3000')
  })
})

describe('generateSeoMeta', () => {
  it('should generate SEO metadata correctly with Facebook and Twitter data', () => {
    const seo = blogJson.attributes.seo

    const result = generateSeoMeta('test-path', seo, 'article', 'en_US')
    const publicSiteUrl = getPublicSiteURL()

    expect(result).toEqual({
      metadataBase: new URL(publicSiteUrl),
      alternates: {
        canonical: `${publicSiteUrl}/test-path`,
      },
      title: seo.metaTitle,
      description: seo.metaDescription,
      keywords: seo.keywords,
      openGraph: {
        title: seo.metaSocial[0].title,
        description: seo.metaSocial[0].description,
        siteName: process.env.NEXT_PUBLIC_SITE_NAME,
        images: [
          {
            url: seo.metaSocial[0].image.data.attributes.url,
            width: seo.metaSocial[0].image.data.attributes.width,
            height: seo.metaSocial[0].image.data.attributes.height,
          },
        ],
        locale: 'en_US',
        type: 'article',
      },
      twitter: {
        cardType: 'summary_large_image',
        title: seo.metaSocial[1].title,
        description: seo.metaSocial[1].description,
        images: [seo.metaSocial[1].image.data.attributes.url],
      },
    })
  })

  it('should generate SEO metadata correctly without Facebook and Twitter data', () => {
    const seo = blogJson.attributes.seo
    // remove Facebook and Twitter data
    seo.metaSocial = []

    const result = generateSeoMeta('test-path', seo, 'article', 'en_US')
    const publicSiteUrl = getPublicSiteURL()

    expect(result).toEqual({
      metadataBase: new URL(publicSiteUrl),
      alternates: {
        canonical: `${publicSiteUrl}/test-path`,
      },
      title: seo.metaTitle,
      description: seo.metaDescription,
      keywords: seo.keywords,
      openGraph: {
        title: seo.metaTitle,
        description: seo.metaDescription,
        siteName: process.env.NEXT_PUBLIC_SITE_NAME,
        images: [
          {
            url: seo.metaImage.data.attributes.url,
            width: seo.metaImage.data.attributes.width,
            height: seo.metaImage.data.attributes.height,
          },
        ],
        locale: 'en_US',
        type: 'article',
      },
      twitter: {
        cardType: 'summary_large_image',
        title: seo.metaTitle,
        description: seo.metaDescription,
        images: [seo.metaImage.data.attributes.url],
      },
    })
  })
})

describe('generateWebPageJsonLd', () => {
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

describe('generatePersonJsonLd', () => {
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

describe('generateArticleJsonLd', () => {
  it('should generate Article JSON-LD correctly', () => {
    const blog = blogJson
    const publicSiteUrl = getPublicSiteURL()

    const result = generateArticleJsonLd(blog)

    expect(result).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Article',
      url: `${publicSiteUrl}/blog/${blog.attributes.slug}`,
      author: {
        '@type': 'Person',
        name: process.env.NEXT_PUBLIC_SITE_NAME!,
        url: publicSiteUrl,
      },
      name: blog.attributes.title,
      headline: blog.attributes.seo.metaDescription,
      image: {
        '@type': 'ImageObject',
        url: blog.attributes.seo.metaImage.data.attributes.url,
        width: blog.attributes.seo.metaImage.data.attributes.width,
        height: blog.attributes.seo.metaImage.data.attributes.height,
      },
      publisher: {
        '@type': 'Person',
        name: process.env.NEXT_PUBLIC_SITE_NAME!,
        url: publicSiteUrl,
      },
      datePublished: blog.attributes.publishedAt,
      dateModified: blog.attributes.updatedAt,
      dateCreated: blog.attributes.createdAt,
    })
  })
})

describe('generateListArticleJsonLd', () => {
  it('should generate List Article JSON-LD correctly', () => {
    const blogs = [blogsJson[0], blogsJson[1]]
    const publicSiteUrl = getPublicSiteURL()

    const result = generateListArticleJsonLd(blogs)

    expect(result).toEqual({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          item: {
            '@type': 'Article',
            url: `${publicSiteUrl}/blog/${blogs[0].attributes.slug}`,
            headline: blogs[0].attributes.title,
            datePublished: blogs[0].attributes.publishedAt,
            dateModified: blogs[0].attributes.updatedAt,
            dateCreated: blogs[0].attributes.createdAt,
            image: {
              '@type': 'ImageObject',
              url: blogs[0].attributes.seo.metaImage.data.attributes.url,
              width: blogs[0].attributes.seo.metaImage.data.attributes.width,
              height: blogs[0].attributes.seo.metaImage.data.attributes.height,
            },
            author: {
              '@type': 'Person',
              name: process.env.NEXT_PUBLIC_SITE_NAME!,
              url: publicSiteUrl,
            },
            publisher: {
              '@type': 'Person',
              name: process.env.NEXT_PUBLIC_SITE_NAME!,
              url: publicSiteUrl,
            },
          },
        },
        {
          '@type': 'ListItem',
          position: 2,
          item: {
            '@type': 'Article',
            url: `${publicSiteUrl}/blog/${blogs[1].attributes.slug}`,
            headline: blogs[1].attributes.title,
            datePublished: blogs[1].attributes.publishedAt,
            dateModified: blogs[1].attributes.updatedAt,
            dateCreated: blogs[1].attributes.createdAt,
            image: {
              '@type': 'ImageObject',
              url: blogs[1].attributes.seo.metaImage.data.attributes.url,
              width: blogs[1].attributes.seo.metaImage.data.attributes.width,
              height: blogs[1].attributes.seo.metaImage.data.attributes.height,
            },
            author: {
              '@type': 'Person',
              name: process.env.NEXT_PUBLIC_SITE_NAME!,
              url: publicSiteUrl,
            },
            publisher: {
              '@type': 'Person',
              name: process.env.NEXT_PUBLIC_SITE_NAME!,
              url: publicSiteUrl,
            },
          },
        },
      ],
    })
  })
})

describe('generateProfilePageJsonLd', () => {
  it('should generate Profile Page JSON-LD correctly without hasPart', () => {
    const profile = profileJson.data as Profile
    const publicSiteUrl = getPublicSiteURL()

    const result = generateProfilePageJsonLd(profile)

    expect(result).toEqual({
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      dateCreated: profile.attributes.createdAt,
      dateModified: profile.attributes.updatedAt,
      mainEntity: {
        '@id': '#person',
        '@type': 'Person',
        name: process.env.NEXT_PUBLIC_SITE_NAME!,
        image: profile.attributes.portraitPhoto.data.attributes.url,
        jobTitle: profile.attributes.title,
        url: publicSiteUrl,
        sameAs: [
          profile.attributes.socials[0].href,
          profile.attributes.socials[1].href,
          profile.attributes.socials[2].href,
          profile.attributes.socials[3].href,
        ],
      },
    })
  })

  it('should generate Profile Page JSON-LD correctly with hasPart', () => {
    const profile = profileJson.data as Profile
    const publicSiteUrl = getPublicSiteURL()

    const hasPart = [blogsJson[0], blogsJson[1]]

    const result = generateProfilePageJsonLd(profile, hasPart)

    expect(result).toEqual({
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      dateCreated: profile.attributes.createdAt,
      dateModified: profile.attributes.updatedAt,
      mainEntity: {
        '@id': '#person',
        '@type': 'Person',
        name: process.env.NEXT_PUBLIC_SITE_NAME!,
        image: profile.attributes.portraitPhoto.data.attributes.url,
        jobTitle: profile.attributes.title,
        url: publicSiteUrl,
        sameAs: [
          profile.attributes.socials[0].href,
          profile.attributes.socials[1].href,
          profile.attributes.socials[2].href,
          profile.attributes.socials[3].href,
        ],
      },
      hasPart: [
        {
          '@type': 'Article',
          headline: hasPart[0].attributes.title,
          url: `${publicSiteUrl}/blog/${hasPart[0].attributes.slug}`,
          image: {
            '@type': 'ImageObject',
            url: hasPart[0].attributes.seo.metaImage.data.attributes.url,
            width: hasPart[0].attributes.seo.metaImage.data.attributes.width,
            height: hasPart[0].attributes.seo.metaImage.data.attributes.height,
          },
          datePublished: hasPart[0].attributes.publishedAt,
          dateModified: hasPart[0].attributes.updatedAt,
          dateCreated: hasPart[0].attributes.createdAt,
          author: { '@id': '#person' },
        },
        {
          '@type': 'Article',
          headline: hasPart[1].attributes.title,
          url: `${publicSiteUrl}/blog/${hasPart[1].attributes.slug}`,
          image: {
            '@type': 'ImageObject',
            url: hasPart[1].attributes.seo.metaImage.data.attributes.url,
            width: hasPart[1].attributes.seo.metaImage.data.attributes.width,
            height: hasPart[1].attributes.seo.metaImage.data.attributes.height,
          },
          datePublished: hasPart[1].attributes.publishedAt,
          dateModified: hasPart[1].attributes.updatedAt,
          dateCreated: hasPart[1].attributes.createdAt,
          author: { '@id': '#person' },
        },
      ],
    })
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
