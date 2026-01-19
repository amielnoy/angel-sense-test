import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'

test.describe('Population by Country - Search No Results', () => {
  test('searching for a non-existent country returns no rows', async ({ populationPage }) => {
    test.setTimeout(100000)
    await populationPage.goto()

    await populationPage.setSearch('not-a-country')

    const emptyCell = populationPage.page.locator('td.dataTables_empty')
    if ((await emptyCell.count()) > 0) {
      await expect(emptyCell).toBeVisible()
      return
    }

    const rowCount = await populationPage.getRowCount()
    expect(rowCount).toBe(1)
  })
})
