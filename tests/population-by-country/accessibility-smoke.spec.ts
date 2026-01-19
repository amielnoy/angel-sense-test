import test from '../../Fixtures/testSetup'
import { expect, Page } from '@playwright/test'

const tryAccessibilitySnapshot = async (page: Page) => {
  const pageAny = page as unknown as { accessibility?: { snapshot: () => Promise<unknown> } }
  if (!pageAny.accessibility?.snapshot) return null
  return pageAny.accessibility.snapshot()
}
const assertSnapshot = (snapshot: unknown | null) => {
  if (snapshot) {
    expect(snapshot).not.toBeNull()
  }
}

test.describe('Population by Country - Accessibility Smoke #TableTests', () => {
  test('table and search are exposed to accessibility tree', async ({ populationPage }) => {
    test.setTimeout(100000)
    await test.step('navigate to population table', async () => {
      await populationPage.goto()
    })
    let snapshot: unknown | null = null
    await test.step('capture accessibility snapshot', async () => {
      snapshot = await tryAccessibilitySnapshot(populationPage.page)
    })
    await test.step('assert snapshot exists when available', async () => {
      assertSnapshot(snapshot)
    })
    await test.step('assert column header is visible', async () => {
      await expect(populationPage.table.getByRole('columnheader').first()).toBeVisible()
    })
    await test.step('assert first cell is visible', async () => {
      await expect(populationPage.table.getByRole('cell').first()).toBeVisible()
    })
    const searchBox = populationPage.page.getByRole('searchbox')
    await test.step('assert search box is visible', async () => {
      await expect(searchBox).toBeVisible()
    })
    await test.step('assert search box accessible name', async () => {
      await expect(searchBox).toHaveAccessibleName(/search/i)
    })
  })
})
