import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'
import { parseNumber } from './utils'

test.describe('Population by Country - Search Exact #TableTests', () => {
  test('searching India shows India row', async ({ populationPage }) => {
    test.setTimeout(100000)
    await test.step('navigate to population table', async () => {
      await populationPage.goto()
    })
    await test.step('search for India', async () => {
      await populationPage.setSearch('India')
    })
    let indiaRow = populationPage.rowByCountry('India')
    await test.step('locate India row', async () => {
      indiaRow = populationPage.rowByCountry('India')
    })
    await test.step('assert India row is visible', async () => {
      await expect(indiaRow).toBeVisible()
    })
    let populationText = ''
    await test.step('read population value', async () => {
      populationText = await populationPage.getCellText('India', 'Population 2025')
    })
    let yearlyChangeText = ''
    await test.step('read yearly change value', async () => {
      yearlyChangeText = await populationPage.getCellText('India', 'Yearly Change')
    })
    await test.step('assert population is positive', async () => {
      expect(parseNumber(populationText)).toBeGreaterThan(0)
    })
    await test.step('assert yearly change is numeric', async () => {
      expect(Number.isNaN(parseNumber(yearlyChangeText))).toBe(false)
    })
  })
})
