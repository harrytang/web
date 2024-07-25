import { Blog } from '@/lib/blogs'
import { Profile } from '@/lib/profile'
import { test, expect, request } from '@playwright/test'

test('should open the Home page', async ({ page }) => {
  // Fetch the profile data from the API
  const reqCtx = await request.newContext({
    baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
  })
  const apiResponse = await reqCtx.get(
    '/api/profile?populate[0]=socials&populate[1]=photos',
  )
  const { data } = (await apiResponse.json()) as { data: Profile }

  // fetch blogs data from the API
  const blogsResponse = await reqCtx.get(
    `/api/blogs?pagination[limit]=${process.env.NEXT_PUBLIC_HOME_PAGE_SIZE}&sort=publishedAt:desc`,
  )
  const { data: blogs } = (await blogsResponse.json()) as {
    data: Blog[]
  }

  // Open the page
  await page.goto('/')

  // Check that the title is correct
  await expect(page.locator('h1')).toContainText(data.attributes.title)

  // check the social links are displayed
  for (const social of data.attributes.socials) {
    expect(page.locator(`a[href="${social.href}"]`)).toBeDefined()
  }

  // check that the photos are displayed
  for (const photo of data.attributes.photos.data) {
    expect(page.locator(`img[alt="${photo.attributes.caption}"]`)).toBeDefined()
  }

  // Check that the blogs are displayed
  for (const blog of blogs) {
    await expect(
      page.locator(`h2:has-text("${blog.attributes.title}")`),
    ).toBeVisible()
  }
})
