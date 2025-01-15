import qs from 'qs'
import { getStrapiURL } from './helper'

const fetchAPI = async <T>(
  path: string,
  urlParamsObject: object = {},
  options: object = {},
): Promise<{
  data: T
  meta: {
    pagination: {
      start: number
      limit: number
      total: number
    }
  }
}> => {
  // Merge default and user options
  const cache = (
    process.env.NODE_ENV === 'development' ? 'no-store' : 'force-cache'
  ) as RequestCache
  const mergedOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    cache,
    ...options,
  }

  // Build request URL
  const queryString = qs.stringify(urlParamsObject)
  const requestUrl = `${getStrapiURL(`/api${path}${queryString ? `?${queryString}` : ''}`)}`

  // Trigger API call
  const response = await fetch(requestUrl, mergedOptions)

  // Handle response
  if (!response.ok) {
    console.error(response.statusText)
    throw new Error(`An error occured please try again`)
  }
  const res = await response.json()
  return {
    data: res.data,
    meta: res.meta,
  }
}

const getAllEntitySlugs = async (entity: string) => {
  let allSlugs: string[] = []
  let start = 0
  const limit = process.env.SITEMAP_SIZE
    ? parseInt(process.env.SITEMAP_SIZE)
    : 1000
  let hasMore = true

  while (hasMore) {
    const res = await fetchAPI<any[]>(`/${entity}`, {
      locale: 'all',
      pagination: { limit, start },
    })

    // Extract slugs from the response
    const slugs = res.data.map((item) => item.attributes.slug)
    allSlugs = allSlugs.concat(slugs)

    // Check if there are more items to fetch
    const total = res.meta.pagination.total
    start += limit
    hasMore = start < total
  }

  return allSlugs
}

export { fetchAPI, getAllEntitySlugs }
