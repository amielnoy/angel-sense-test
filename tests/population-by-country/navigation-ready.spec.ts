import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'

test.describe('Population by Country - Navigation & Ready', () => {
  test('page loads and table is ready', async ({ populationPage }) => {
    test.setTimeout(100000)

    await populationPage.goto()

    await expect(populationPage.page).toHaveTitle(/Population by Country.*Worldometer/i)
    const headers = await populationPage.getHeaders()
    expect(headers.length).toBeGreaterThan(0)

    const rowCount = await populationPage.getRowCount()
    expect(rowCount).toBeGreaterThan(0)
  })
})
