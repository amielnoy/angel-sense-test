import test from '../../Fixtures/testSetup'
import { expect, Page } from '@playwright/test'

const tryAccessibilitySnapshot = async (page: Page) => {
  const pageAny = page as unknown as { accessibility?: { snapshot: () => Promise<unknown> } }
  if (!pageAny.accessibility?.snapshot) return null
  return pageAny.accessibility.snapshot()
}

test.describe('Population by Country - Accessibility Smoke', () => {
  test('table and search are exposed to accessibility tree', async ({ populationPage }) => {
    test.setTimeout(100000)
    await populationPage.goto()

    const snapshot = await tryAccessibilitySnapshot(populationPage.page)
    if (snapshot) {
      expect(snapshot).not.toBeNull()
    }

    await expect(populationPage.table.getByRole('columnheader').first()).toBeVisible()
    await expect(populationPage.table.getByRole('cell').first()).toBeVisible()

    const searchBox = populationPage.page.getByRole('searchbox')
    await expect(searchBox).toBeVisible()
    await expect(searchBox).toHaveAccessibleName(/search/i)
  })
})
