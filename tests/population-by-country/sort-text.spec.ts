import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'
import { getHeaderIndex } from './utils'

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
    const clickUntilSorted = async (header: string, direction: 'asc' | 'desc', maxClicks = 3) => {
      const idx = await getHeaderIndex(populationPage, header)
      const headersLocator =
        (await populationPage.headerCellsRole.count()) > 0 ? populationPage.headerCellsRole : populationPage.headerCellsCss
      const th = headersLocator.nth(idx)
      const ariaExpected = direction === 'asc' ? 'ascending' : 'descending'
      const classExpected = direction === 'asc' ? /datatable-ascending|sorting_asc/ : /datatable-descending|sorting_desc/
      for (let i = 0; i < maxClicks; i++) {
        const aria = (await th.getAttribute('aria-sort')) || ''
        const cls = (await th.getAttribute('class')) || ''
        if (aria === ariaExpected && classExpected.test(cls)) {
          return
        }
        await th.click()
      }
      await expect(th).toHaveAttribute('aria-sort', ariaExpected)
    }

    await test.step('sort by country ascending', async () => {
      await populationPage.sortBy('Country (or dependency)', 'asc')
      await clickUntilSorted('Country (or dependency)', 'asc')
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
      await clickUntilSorted('Country (or dependency)', 'desc')
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
