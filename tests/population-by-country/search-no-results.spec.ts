import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'

test.describe('Population by Country - Search No Results', () => {
  test('searching for a non-existent country returns no rows', async ({ populationPage }) => {
    test.setTimeout(100000)
    await test.step('navigate to population table', async () => {
      await populationPage.goto()
    })
    await test.step('search for a non-existent country', async () => {
      await populationPage.setSearch('not-a-country')
    })
    await test.step('verify no results are shown', async () => {
      const emptyCell = populationPage.page.locator('td.dataTables_empty')
      if ((await emptyCell.count()) > 0) {
        await expect(emptyCell).toBeVisible()
        return
      }

      const rowCount = await populationPage.getRowCount()
      expect(rowCount).toBe(1)
    })
  })
})
