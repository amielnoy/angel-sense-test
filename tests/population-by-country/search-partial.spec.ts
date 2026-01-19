import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'

test.describe('Population by Country - Search Partial', () => {
  test('partial search is case-insensitive and matches substrings', async ({ populationPage }) => {
    test.setTimeout(100000)
    await test.step('navigate to population table', async () => {
      await populationPage.goto()
    })
    await test.step('search for partial match', async () => {
      await populationPage.setSearch('uni')
    })
    await test.step('verify results contain United*', async () => {
      const countries = await populationPage.getTopCountries(20)
      expect(countries.length).toBeGreaterThan(0)

      const lower = countries.map(c => c.toLowerCase())
      const hasUnited = lower.some(c => c.includes('united'))
      expect(hasUnited).toBe(true)
    })
  })
})
