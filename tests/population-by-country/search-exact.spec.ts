import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'
import { parseNumber } from './utils'

test.describe('Population by Country - Search Exact', () => {
  test('searching India shows India row', async ({ populationPage }) => {
    test.setTimeout(100000)
    await test.step('navigate to population table', async () => {
      await populationPage.goto()
    })
    await test.step('search for India', async () => {
      await populationPage.setSearch('India')
    })
    await test.step('verify India row is visible', async () => {
      const indiaRow = populationPage.rowByCountry('India')
      await expect(indiaRow).toBeVisible()
    })
    await test.step('validate population and yearly change values', async () => {
      const populationText = await populationPage.getCellText('India', 'Population 2025')
      const yearlyChangeText = await populationPage.getCellText('India', 'Yearly Change')

      expect(parseNumber(populationText)).toBeGreaterThan(0)
      expect(Number.isNaN(parseNumber(yearlyChangeText))).toBe(false)
    })
  })
})
