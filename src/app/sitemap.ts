import { getPublicSiteURL } from '@/lib/helper'
import { MetadataRoute } from 'next'
import { Blog } from '@/lib/blogs'
import { Page } from '@/lib/pages'
import { fetchAPI } from '@/lib/strapi'

export const revalidate = 3600 // 1 hour

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const publicSiteUrl = getPublicSiteURL()
  const sitemapSize = process.env.SITEMAP_SIZE
    ? parseInt(process.env.SITEMAP_SIZE)
    : 1000
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

export default sitemap
