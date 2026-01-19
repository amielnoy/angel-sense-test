import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'
import expectedDensities from '../data/worldometers-density-expected.json'

test.describe('Worldometers Population by Country', () => {
  test('countries with population above 1,000,000,000 are India & China', async ({ populationPage }) => {
    test.setTimeout(100000)
    await populationPage.goto()

    // Ensure we read from the default view (no filter)
    await populationPage.clearSearch()

    // Parse full table and filter by population > 1,000,000,000 (avoid cutting off China/India)
    const rows = await populationPage.getTableData(30)
    const billion = 1_000_000_000
    const billionPlus = rows
      .map(r => ({
        country: r['Country (or dependency)'],
        pop2025: Number((r['Population 2025'] || '').replace(/[^0-9]/g, '')),
      }))
      .filter(r => r.pop2025 > billion)
      .map(r => (r.country || '').trim())

    // Expect exactly China and India (order-agnostic)
    const normalized = billionPlus.map(c => c.toLowerCase())
    expect(new Set(normalized)).toEqual(new Set(['china', 'india']))
    expect(normalized.length).toBe(2)
  })

  test('there are 16 countries with population above 100,000,000', async ({ populationPage }) => {
    test.setTimeout(100000)
    const expectedCountriesAbove100Million = 16
    await populationPage.goto()
    await populationPage.clearSearch()

    const rows = await populationPage.getTableData(50)
    const hundredMillion = 100_000_000
    const largeCountries = rows
      .map(r => Number((r['Population 2025'] || '').replace(/[^0-9]/g, '')) || 0)
      .filter(pop => pop > hundredMillion)

    expect(largeCountries.length).toBe(expectedCountriesAbove100Million)
  })

  test('density is consistent for 30 most populated countries', async ({ populationPage }) => {
    test.setTimeout(100000)
    await populationPage.goto()
    await populationPage.clearSearch()

    const rows = await populationPage.getTableData(30)
    const expectedByCountry = new Map(
      expectedDensities.map(entry => [entry.country.toLowerCase(), entry.density]),
    )
    const mismatches: string[] = []

    const parseNumber = (value: string | undefined): number =>
      Number((value || '').replace(/[^0-9.-]/g, '')) || 0

    for (const row of rows) {
      const country = (row['Country (or dependency)'] || '').trim() || 'Unknown'
      const density = parseNumber(row['Density (P/Km²)'])
      const expectedDensity = expectedByCountry.get(country.toLowerCase())

      expect(density, `${country} density missing`).toBe(expectedDensity)
      if (expectedDensity === undefined) {
        mismatches.push(`${country}: missing expected density in dataset`)
        continue
      }
      const difference = Math.abs((expectedDensity as number) - density)
      if (difference > 1) {
        mismatches.push(`${country}: expected ${expectedDensity}, got ${density}`)
      }
    }

    expect(mismatches).toEqual([])
  })
})
