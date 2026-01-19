import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'

test.describe('Population by Country - Search Partial', () => {
  test('partial search is case-insensitive and matches substrings', async ({ populationPage }) => {
    test.setTimeout(100000)
    await populationPage.goto()

    await populationPage.setSearch('uni')

    const countries = await populationPage.getTopCountries(20)
    expect(countries.length).toBeGreaterThan(0)

    const lower = countries.map(c => c.toLowerCase())
    const hasUnited = lower.some(c => c.includes('united'))
    expect(hasUnited).toBe(true)
  })
})
