import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'

test.describe('Population by Country - Search Partial #TableTests', () => {
  test('partial search is case-insensitive and matches substrings', async ({ populationPage }) => {
    test.setTimeout(100000)
    await test.step('navigate to population table', async () => {
      await populationPage.goto()
    })
    await test.step('search for partial match', async () => {
      await populationPage.setSearch('uni')
    })
    let countries: string[] = []
    await test.step('collect top countries', async () => {
      countries = await populationPage.getTopCountries(20)
    })
    await test.step('assert results are returned', async () => {
      expect(countries.length).toBeGreaterThan(0)
    })
    let lower: string[] = []
    await test.step('normalize country names', async () => {
      lower = countries.map(c => c.toLowerCase())
    })
    let hasUnited = false
    await test.step('check for "united" match', async () => {
      hasUnited = lower.some(c => c.includes('united'))
    })
    await test.step('assert "united" match', async () => {
      expect(hasUnited).toBe(true)
    })
  })
})
