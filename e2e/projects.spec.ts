import { Page } from '@/lib/pages'
import { Project } from '@/lib/projects'
import { test, expect, request } from '@playwright/test'

test('should open the Projects page', async ({ page }) => {
  const reqCtx = await request.newContext({
    baseURL: process.env.NEXT_PUBLIC_STRAPI_API_URL,
  })
  // fetch page from the API
  const pagesResponse = await reqCtx.get(`/api/pages?filters[slug]=projects`)
  const { data: pages } = (await pagesResponse.json()) as { data: Page[] }

  // fetch projects data from the API
  const projectsResponse = await reqCtx.get('/api/projects')
  const { data: projects } = (await projectsResponse.json()) as {
    data: Project[]
  }

  // Open the page
  await page.goto('/projects')

  // Check that the subtitle is correct
  await expect(page.locator('h1')).toContainText(pages[0].attributes.subtitle)

  // Check that the projects are displayed
  for (const project of projects) {
    await expect(
      page.locator(`h2:has-text("${project.attributes.name}")`),
    ).toBeVisible()
  }
})
