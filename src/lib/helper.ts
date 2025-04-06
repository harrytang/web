import { Seo } from '@/types/seo'
import { Profile } from './profile'
import { Blog } from './blogs'
import { Use } from './uses'

const getStrapiURL = (path: string = '') => {
  // Default to the server-side URL
  let url = process.env.STRAPI_API_URL

  // When on the client-side (in the browser), use the environment variable
  if (typeof window !== 'undefined') {
    url = process.env.NEXT_PUBLIC_STRAPI_API_URL
  }

  return `${url}${path}`
}
const getPublicSiteURL = () => {
  let publicSiteUrl = 'http://localhost:3000'
  if (
    typeof process.env.NEXT_PUBLIC_SITE_URL === 'string' &&
    process.env.NEXT_PUBLIC_SITE_URL.length > 0
  ) {
    publicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL
  }
  return publicSiteUrl
}

const generateSeoMeta = (
  path: string,
  seo: Seo,
  type: string,
  locale: string,
) => {
  const publicSiteUrl = getPublicSiteURL()

  // Find the first Facebook and Twitter entries in metaSocial
  const facebookData = seo.metaSocial.find(
    (entry) => entry.socialNetwork === 'Facebook',
  )
  const twitterData = seo.metaSocial.find(
    (entry) => entry.socialNetwork === 'Twitter',
  )

  return {
    metadataBase: new URL(publicSiteUrl),
    alternates: {
      canonical: seo.canonicalURL ?? `${publicSiteUrl}/${path}`,
    },
    title: seo.metaTitle,
    description: seo.metaDescription,
    keywords: seo.keywords,
    openGraph: {
      title: facebookData?.title || seo.metaTitle,
      description: facebookData?.description || seo.metaDescription,
      siteName: process.env.NEXT_PUBLIC_SITE_NAME,
      images: facebookData
        ? [
            {
              url: facebookData.image.data.attributes.url,
              width: facebookData.image.data.attributes.width,
              height: facebookData.image.data.attributes.height,
            },
          ]
        : [
            {
              url: seo.metaImage.data.attributes.url,
              width: seo.metaImage.data.attributes.width,
              height: seo.metaImage.data.attributes.height,
            },
          ],
      locale: locale,
      type: type,
      url: `${publicSiteUrl}/${path}`,
    },
    twitter: {
      cardType: 'summary_large_image',
      title: twitterData?.title || seo.metaTitle,
      description: twitterData?.description || seo.metaDescription,
      images: twitterData
        ? [twitterData.image.data.attributes.url]
        : [seo.metaImage.data.attributes.url],
    },
  }
}

const generateWebPageJsonLd = ({
  name,
  description,
}: {
  name: string
  description: string
}) => {
  const publicSiteUrl = getPublicSiteURL()

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    publisher: {
      '@type': 'Person',
      name: process.env.NEXT_PUBLIC_SITE_NAME!,
      url: publicSiteUrl,
    },
  }
}

const generatePersonJsonLd = (profile: Profile) => {
  const publicSiteUrl = getPublicSiteURL()
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: process.env.NEXT_PUBLIC_SITE_NAME!,
    image: profile.attributes.portraitPhoto.data.attributes.url,
    jobTitle: profile.attributes.title,
    url: publicSiteUrl,
    sameAs: profile.attributes.socials.map((link) => link.href), // other urls
  }
}

const generateArticleJsonLd = (blog: Blog) => {
  const publicSiteUrl = getPublicSiteURL()
  const createdAt = blog.attributes.createdAt
  const publishedAt = blog.attributes.publishedAt
  const modifiedAt = blog.attributes.updatedAt

  return {
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

    datePublished: publishedAt,
    dateModified: modifiedAt,
    dateCreated: createdAt,
  }
}

const generateListArticleJsonLd = (blogs: Blog[]) => {
  const publicSiteUrl = getPublicSiteURL()
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: blogs.map((blog, index) => {
      return {
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Article',
          url: `${publicSiteUrl}/blog/${blog.attributes.slug}`,
          headline: blog.attributes.title,
          datePublished: blog.attributes.publishedAt,
          dateModified: blog.attributes.updatedAt,
          dateCreated: blog.attributes.createdAt,
          image: {
            '@type': 'ImageObject',
            url: blog.attributes.seo.metaImage.data.attributes.url,
            width: blog.attributes.seo.metaImage.data.attributes.width,
            height: blog.attributes.seo.metaImage.data.attributes.height,
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
      }
    }),
  }
}

const generateProfilePageJsonLd = (profile: Profile, hasPart: Blog[] = []) => {
  const publicSiteUrl = getPublicSiteURL()
  const hasPartList = hasPart.map((blog) => {
    return {
      '@type': 'Article',
      headline: blog.attributes.title,
      url: `${publicSiteUrl}/blog/${blog.attributes.slug}`,
      image: {
        '@type': 'ImageObject',
        url: blog.attributes.seo.metaImage.data.attributes.url,
        width: blog.attributes.seo.metaImage.data.attributes.width,
        height: blog.attributes.seo.metaImage.data.attributes.height,
      },
      datePublished: blog.attributes.publishedAt,
      dateModified: blog.attributes.updatedAt,
      dateCreated: blog.attributes.createdAt,
      author: { '@id': '#person' },
    }
  })
  const profilePage = {
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
      sameAs: profile.attributes.socials.map((link) => link.href), // other urls
    },
  }
  return hasPart.length > 0
    ? { ...profilePage, hasPart: hasPartList }
    : profilePage
}

const clamp = (number: number, a: number, b: number) => {
  let min = Math.min(a, b)
  let max = Math.max(a, b)
  return Math.min(Math.max(number, min), max)
}

const categorizeItems = (items: Use[]) => {
  const categoryMap: { [key: string]: Use[] } = {}

  // Group items by category
  items.forEach((item) => {
    const { category } = item.attributes
    if (!categoryMap[category]) {
      categoryMap[category] = []
    }
    categoryMap[category].push(item)
  })

  return categoryMap
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

const isInternalLink = (href: string) =>
  href.startsWith('/') || href.startsWith('#')

export {
  getPublicSiteURL,
  getStrapiURL,
  generateSeoMeta,
  generateWebPageJsonLd,
  generatePersonJsonLd,
  generateArticleJsonLd,
  generateListArticleJsonLd,
  generateProfilePageJsonLd,
  clamp,
  categorizeItems,
  formatDate,
  isInternalLink,
}
