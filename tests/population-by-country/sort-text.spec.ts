import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'

test.describe('Population by Country - Sort Text', () => {
  test('country column sorts alphabetically', async ({ populationPage }) => {
    test.setTimeout(100000)
    await populationPage.goto()

    const compareNames = (names: string[], direction: 'asc' | 'desc') => {
      const sorted = [...names].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
      const expected = direction === 'asc' ? sorted : sorted.reverse()
      expect(names).toEqual(expected)
    }

    await populationPage.sortBy('Country (or dependency)', 'asc')
    const ascNames = await populationPage.getTopCountries(10)
    compareNames(ascNames, 'asc')

    await populationPage.sortBy('Country (or dependency)', 'desc')
    const descNames = await populationPage.getTopCountries(10)
    compareNames(descNames, 'desc')
  })
})
