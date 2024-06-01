import { test, expect } from '@playwright/test'

test('should open the home page', async ({ page }) => {
  // Open the home page
  await page.goto('/')
  // Check that the title is correct
  await expect(page.locator('h1')).toContainText(
    'Solutions Architect & Cloud Engineer',
  )
})
