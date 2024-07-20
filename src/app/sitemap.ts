import { fetchAPI, getPublicSiteURL } from '@/lib/hepler'
import { MetadataRoute } from 'next'
import { Blog } from '@/lib/blogs'
import { Page } from '@/lib/pages'

export const revalidate = 3600 // 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publicSiteUrl = getPublicSiteURL()
  const sitemapSize = 1000
  // static pages
  const pages = [
    {
      url: `${publicSiteUrl}/`,
      lastModified: new Date().toISOString(),
    },
    {
      url: `${publicSiteUrl}/about`,
      lastModified: new Date().toISOString(),
    },
  ]

  // blogs
  const blogRes = await fetchAPI<Blog[]>('/blogs', {
    sort: 'createdAt:DESC',
    fields: ['slug', 'updatedAt'],
    pagination: {
      start: 0,
      limit: sitemapSize,
    },
  })
  const blogURLs = blogRes.data.map((blog) => {
    return {
      url: `${publicSiteUrl}/blog/${blog.attributes.slug}`,
      lastModified: new Date(blog.attributes.updatedAt).toISOString(),
    }
  })

  // pages
  const pageRes = await fetchAPI<Page[]>('/pages', {
    sort: 'createdAt:DESC',
    fields: ['slug', 'updatedAt'],
    pagination: {
      start: 0,
      limit: sitemapSize,
    },
  })
  const pageURLs = pageRes.data.map((page) => {
    return {
      url: `${publicSiteUrl}/${page.attributes.slug}`,
      lastModified: new Date(page.attributes.updatedAt).toISOString(),
    }
  })

  return [...pages, ...blogURLs, ...pageURLs]
}
