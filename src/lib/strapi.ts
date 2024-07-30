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
  console.info('Fetching', requestUrl)
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

export { fetchAPI }
