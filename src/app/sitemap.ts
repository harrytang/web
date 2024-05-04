import { fetchAPI, getPublicSiteURL } from '@/lib/hepler'
import { MetadataRoute } from 'next'
import { Blog } from '@/lib/blogs'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const publicSiteUrl = getPublicSiteURL()
  const sitemapSize = 1000
  // pages
  const pages = [
    {
      url: `${publicSiteUrl}/`,
      lastModified: new Date().toISOString(),
    },
    {
      url: `${publicSiteUrl}/about`,
      lastModified: new Date().toISOString(),
    },
    {
      url: `${publicSiteUrl}/articles`,
      lastModified: new Date().toISOString(),
    },
    {
      url: `${publicSiteUrl}/projects`,
      lastModified: new Date().toISOString(),
    },
    {
      url: `${publicSiteUrl}/expertise`,
      lastModified: new Date().toISOString(),
    },
    {
      url: `${publicSiteUrl}/uses`,
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

  return [...pages, ...blogURLs]
}
