import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'

test.describe('Population by Country - Navigation & Ready', () => {
  test('page loads and table is ready', async ({ populationPage }) => {
    test.setTimeout(100000)

    await test.step('navigate to population table', async () => {
      await populationPage.goto()
    })
    await test.step('verify page title and headers', async () => {
      await expect(populationPage.page).toHaveTitle(/Population by Country.*Worldometer/i)
      const headers = await populationPage.getHeaders()
      expect(headers.length).toBeGreaterThan(0)
    })
    await test.step('verify row count is non-zero', async () => {
      const rowCount = await populationPage.getRowCount()
      expect(rowCount).toBeGreaterThan(0)
    })
  })
})
