import { Blog } from '@/lib/blogs'
import { Page } from '@/lib/pages'
import { test, expect, request } from '@playwright/test'

test('should open the Articles page', async ({ page }) => {
  const reqCtx = await request.newContext({
    baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
  })
  // fetch page from the API
  const pagesResponse = await reqCtx.get(`/api/pages?filters[slug]=articles`)
  const { data: pages } = (await pagesResponse.json()) as { data: Page[] }

  // fetch blogs data from the API
  const blogsResponse = await reqCtx.get(
    `/api/blogs?pagination[limit]=${process.env.NEXT_PUBLIC_PAGE_SIZE}&sort=publishedAt:desc`,
  )
  const { data: blogs } = (await blogsResponse.json()) as {
    data: Blog[]
  }

  // Open the page
  await page.goto(`/articles`)

  // Check that the subtitle is correct
  await expect(page.locator('h1')).toContainText(pages[0].attributes.subtitle)

  // Check that the blogs are displayed
  for (const blog of blogs) {
    await expect(
      page.locator(`h2:has-text("${blog.attributes.title}")`),
    ).toBeVisible()
  }
})
