import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'

test.describe('Population by Country - Navigation & Ready #TableTests', () => {
  test('page loads and table is ready', async ({ populationPage }) => {
    test.setTimeout(100000)

    await test.step('navigate to population table', async () => {
      await populationPage.goto()
    })
    await test.step('assert page title', async () => {
      await expect(populationPage.page).toHaveTitle(/Population by Country.*Worldometer/i)
    })
    let headers: string[] = []
    await test.step('read table headers', async () => {
      headers = await populationPage.getHeaders()
    })
    await test.step('assert headers are present', async () => {
      expect(headers.length).toBeGreaterThan(0)
    })
    let rowCount = 0
    await test.step('read row count', async () => {
      rowCount = await populationPage.getRowCount()
    })
    await test.step('assert row count is non-zero', async () => {
      expect(rowCount).toBeGreaterThan(0)
    })
  })
})
