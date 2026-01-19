import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'
import { parseNumber } from './utils'

test.describe('Population by Country - Search Exact', () => {
  test('searching India shows India row', async ({ populationPage }) => {
    test.setTimeout(100000)
    await populationPage.goto()

    await populationPage.setSearch('India')

    const indiaRow = populationPage.rowByCountry('India')
    await expect(indiaRow).toBeVisible()

    const populationText = await populationPage.getCellText('India', 'Population 2025')
    const yearlyChangeText = await populationPage.getCellText('India', 'Yearly Change')

    expect(parseNumber(populationText)).toBeGreaterThan(0)
    expect(Number.isNaN(parseNumber(yearlyChangeText))).toBe(false)
  })
})
