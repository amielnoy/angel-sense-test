import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'
import expectedDensities from '../data/worldometers-density-expected.json'

test.describe('Worldometers Population by Country', () => {
  test('countries with population above 1,000,000,000 are India & China', async ({ populationPage }) => {
    test.setTimeout(100000)
    await test.step('navigate to population table', async () => {
      await populationPage.goto()
      await populationPage.clearSearch()
    })

    const billionPlus = await test.step('collect countries above 1B', async () => {
      const rows = await populationPage.getTableData(30)
      const billion = 1_000_000_000
      return rows
        .map(r => ({
          country: r['Country (or dependency)'],
          pop2025: Number((r['Population 2025'] || '').replace(/[^0-9]/g, '')),
        }))
        .filter(r => r.pop2025 > billion)
        .map(r => (r.country || '').trim())
    })

    await test.step('assert China and India are the only matches', async () => {
      const normalized = billionPlus.map(c => c.toLowerCase())
      expect(new Set(normalized)).toEqual(new Set(['china', 'india']))
      expect(normalized.length).toBe(2)
    })
  })

  test('there are 16 countries with population above 100,000,000', async ({ populationPage }) => {
    test.setTimeout(100000)
    const expectedCountriesAbove100Million = 16
    await test.step('navigate to population table', async () => {
      await populationPage.goto()
      await populationPage.clearSearch()
    })
    const largeCountries = await test.step('collect countries above 100M', async () => {
      const rows = await populationPage.getTableData(50)
      const hundredMillion = 100_000_000
      return rows
        .map(r => Number((r['Population 2025'] || '').replace(/[^0-9]/g, '')) || 0)
        .filter(pop => pop > hundredMillion)
    })

    await test.step('assert expected count', async () => {
      expect(largeCountries.length).toBe(expectedCountriesAbove100Million)
    })
  })

  test('density is consistent for 30 most populated countries', async ({ populationPage }) => {
    test.setTimeout(100000)
    await test.step('navigate to population table', async () => {
      await populationPage.goto()
      await populationPage.clearSearch()
    })

    const mismatches = await test.step('compare density values', async () => {
      const rows = await populationPage.getTableData(30)
      const expectedByCountry = new Map(
        expectedDensities.map(entry => [entry.country.toLowerCase(), entry.density]),
      )
      const localMismatches: string[] = []

      const parseNumber = (value: string | undefined): number =>
        Number((value || '').replace(/[^0-9.-]/g, '')) || 0

      for (const row of rows) {
        const country = (row['Country (or dependency)'] || '').trim() || 'Unknown'
        const density = parseNumber(row['Density (P/Km²)'])
        const expectedDensity = expectedByCountry.get(country.toLowerCase())

        expect(density, `${country} density missing`).toBe(expectedDensity)
        if (expectedDensity === undefined) {
          localMismatches.push(`${country}: missing expected density in dataset`)
          continue
        }
        const difference = Math.abs((expectedDensity as number) - density)
        if (difference > 1) {
          localMismatches.push(`${country}: expected ${expectedDensity}, got ${density}`)
        }
      }
      return localMismatches
    })

    await test.step('assert no mismatches', async () => {
      expect(mismatches).toEqual([])
    })
  })
})
