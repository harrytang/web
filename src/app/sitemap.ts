import { getPublicSiteURL } from '@/lib/helper'
import { MetadataRoute } from 'next'
import { Blog, getBlogs } from '@/lib/blogs'
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

  // articles pages
  const pageSize = parseInt(process.env.NEXT_PUBLIC_PAGE_SIZE!)
  const blogs = await getBlogs(0, 1) // Fetch total count
  const totalPages = Math.ceil(blogs.meta.pagination.total / pageSize)
  const articlePageURLs = Array.from({ length: totalPages }, (_, i) => ({
    url:
      i === 0
        ? `${publicSiteUrl}/articles`
        : `${publicSiteUrl}/articles/${i + 1}`,
    lastModified: new Date().toISOString(),
  }))

  // pages
  const pageRes = await fetchAPI<Page[]>('/pages', {
    sort: 'createdAt:DESC',
    fields: ['slug', 'updatedAt'],
    filters: {
      slug: {
        $not: {
          $eq: 'articles',
        },
      },
    },
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

  return [...pages, ...blogURLs, ...pageURLs, ...articlePageURLs]
}

export default sitemap
