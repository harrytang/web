import { Profile } from '@/lib/profile'
import { test, expect, request } from '@playwright/test'

test('should open the home page', async ({ page }) => {
  // Fetch the profile data from the API
  const reqCtx = await request.newContext({
    baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
  })
  const apiResponse = await reqCtx.get('/api/profile')
  const { data } = (await apiResponse.json()) as { data: Profile }

  // Open the home page
  await page.goto('/')
  // Check that the title is correct
  await expect(page.locator('h1')).toContainText(data.attributes.title)
})
