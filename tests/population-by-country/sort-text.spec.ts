import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'

test.describe('Population by Country - Sort Text #TableTests', () => {
  test('country column sorts alphabetically', async ({ populationPage }) => {
    test.setTimeout(100000)
    await test.step('navigate to population table', async () => {
      await populationPage.goto()
    })

    const compareNames = (names: string[], direction: 'asc' | 'desc') => {
      const sorted = [...names].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
      const expected = direction === 'asc' ? sorted : sorted.reverse()
      expect(names).toEqual(expected)
    }

    await test.step('sort by country ascending', async () => {
      await populationPage.sortBy('Country (or dependency)', 'asc')
    })
    let ascNames: string[] = []
    await test.step('read top country names (asc)', async () => {
      ascNames = await populationPage.getTopCountries(10)
    })
    await test.step('assert ascending order', async () => {
      compareNames(ascNames, 'asc')
    })

    await test.step('sort by country descending', async () => {
      await populationPage.sortBy('Country (or dependency)', 'desc')
    })
    let descNames: string[] = []
    await test.step('read top country names (desc)', async () => {
      descNames = await populationPage.getTopCountries(10)
    })
    await test.step('assert descending order', async () => {
      compareNames(descNames, 'desc')
    })
  })
})
