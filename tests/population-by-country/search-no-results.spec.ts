import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'

test.describe('Population by Country - Search No Results #TableTests', () => {
  test('searching for a non-existent country returns no rows', async ({ populationPage }) => {
    test.setTimeout(100000)
    await test.step('navigate to population table', async () => {
      await populationPage.goto()
    })
    await test.step('search for a non-existent country', async () => {
      await populationPage.setSearch('not-a-country')
    })
    const emptyCell = populationPage.page.locator('td.dataTables_empty')
    let hasEmptyCell = false
    await test.step('check for empty results cell', async () => {
      hasEmptyCell = (await emptyCell.count()) > 0
    })
    if (hasEmptyCell) {
      await test.step('assert empty results cell is visible', async () => {
        await expect(emptyCell).toBeVisible()
      })
      return
    }
    let rowCount = 0
    await test.step('read row count', async () => {
      rowCount = await populationPage.getRowCount()
    })
    await test.step('assert row count for no results', async () => {
      expect(rowCount).toBe(1)
    })
  })
})
