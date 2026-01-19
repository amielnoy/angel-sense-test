import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'
import expectedDensities from '../data/worldometers-density-expected.json'

const collectCountriesAbove = (rows: Record<string, string>[], threshold: number) =>
  rows
    .map(r => ({
      country: r['Country (or dependency)'],
      pop2025: Number((r['Population 2025'] || '').replace(/[^0-9]/g, '')),
    }))
    .filter(r => r.pop2025 > threshold)
    .map(r => (r.country || '').trim())

const findDensityMismatches = (rows: Record<string, string>[], expectedByCountry: Map<string, number>) => {
  const parseNumber = (value: string | undefined): number =>
    Number((value || '').replace(/[^0-9.-]/g, '')) || 0
  const localMismatches: string[] = []
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
}

test.describe('Worldometers Population by Country #TableTests', () => {
  test('countries with population above 1,000,000,000 are India & China', async ({ populationPage }) => {
    test.setTimeout(100000)
    await test.step('navigate to population table', async () => {
      await populationPage.goto()
    })
    await test.step('clear search', async () => {
      await populationPage.clearSearch()
    })
    let rows: Awaited<ReturnType<typeof populationPage.getTableData>> = []
    await test.step('read table data', async () => {
      rows = await populationPage.getTableData(30)
    })
    let billionPlus: string[] = []
    await test.step('collect countries above 1B', async () => {
      billionPlus = collectCountriesAbove(rows, 1_000_000_000)
    })
    let normalized: string[] = []
    await test.step('normalize country names', async () => {
      normalized = billionPlus.map(c => c.toLowerCase())
    })
    await test.step('assert expected countries set', async () => {
      expect(new Set(normalized)).toEqual(new Set(['china', 'india']))
    })
    await test.step('assert expected country count', async () => {
      expect(normalized.length).toBe(2)
    })
  })

  test('there are 16 countries with population above 100,000,000', async ({ populationPage }) => {
    test.setTimeout(100000)
    const expectedCountriesAbove100Million = 16
    await test.step('navigate to population table', async () => {
      await populationPage.goto()
    })
    await test.step('clear search', async () => {
      await populationPage.clearSearch()
    })
    let rows: Awaited<ReturnType<typeof populationPage.getTableData>> = []
    await test.step('read table data', async () => {
      rows = await populationPage.getTableData(50)
    })
    let largeCountries: number[] = []
    await test.step('collect countries above 100M', async () => {
      largeCountries = rows
        .map(r => Number((r['Population 2025'] || '').replace(/[^0-9]/g, '')) || 0)
        .filter(pop => pop > 100_000_000)
    })
    await test.step('assert expected count', async () => {
      expect(largeCountries.length).toBe(expectedCountriesAbove100Million)
    })
  })

  test('density is consistent for 30 most populated countries', async ({ populationPage }) => {
    test.setTimeout(100000)
    await test.step('navigate to population table', async () => {
      await populationPage.goto()
    })
    await test.step('clear search', async () => {
      await populationPage.clearSearch()
    })
    let rows: Awaited<ReturnType<typeof populationPage.getTableData>> = []
    await test.step('read table data', async () => {
      rows = await populationPage.getTableData(30)
    })
    let expectedByCountry = new Map<string, number>()
    await test.step('build expected density map', async () => {
      expectedByCountry = new Map(
        expectedDensities.map(entry => [entry.country.toLowerCase(), entry.density]),
      )
    })
    let mismatches: string[] = []
    await test.step('compare density values', async () => {
      mismatches = findDensityMismatches(rows, expectedByCountry)
    })
    await test.step('assert no mismatches', async () => {
      expect(mismatches).toEqual([])
    })
  })
})
