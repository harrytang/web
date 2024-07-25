import { Page } from '@/lib/pages'
import { test, expect, request } from '@playwright/test'

const slugs = [
  'credits',
  'terms-of-use',
  'privacy-policy',
  'disclaimer',
  'cookie-policy',
]

slugs.forEach((slug) => {
  test(`should open the ${slug} page`, async ({ page }) => {
    // Fetch data from the API
    const reqCtx = await request.newContext({
      baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
    })
    const apiResponse = await reqCtx.get(`/api/pages?filters[slug]=${slug}`)
    const { data } = (await apiResponse.json()) as { data: Page[] }

    // Open the page
    await page.goto(`/${slug}`)

    // Check that the subtitle is correct
    await expect(page.locator('h1')).toContainText(data[0].attributes.subtitle)
  })
})
