import { Page } from '@/lib/pages'
import { Use } from '@/lib/uses'
import { test, expect, request } from '@playwright/test'

test('should open the Gear page', async ({ page }) => {
  const reqCtx = await request.newContext({
    baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
  })
  // fetch page from the API
  const pagesResponse = await reqCtx.get(`/api/pages?filters[slug]=gear`)
  const { data: pages } = (await pagesResponse.json()) as { data: Page[] }

  // fetch uses data from the API
  const usesResponse = await reqCtx.get('/api/uses')
  const { data: uses } = (await usesResponse.json()) as { data: Use[] }

  // Open the page
  await page.goto('/gear')

  // Check that the subtitle is correct
  await expect(page.locator('h1')).toContainText(pages[0].attributes.subtitle)

  // Check that the uses are displayed
  for (const use of uses) {
    await expect(
      page.locator(`h3:has-text("${use.attributes.title}")`),
    ).toBeVisible()
  }
})
