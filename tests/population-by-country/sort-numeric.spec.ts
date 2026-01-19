import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'
import { getHeaderIndex, getRowsLocator, parseNumber } from './utils'

test.describe('Population by Country - Sort Numeric #TableTests', () => {
  test('population column sorts ascending and descending', async ({ populationPage }) => {
    await test.step('navigate to population table', async () => {
      await populationPage.goto()
    })

    const columnIndex = await getHeaderIndex(populationPage, 'Population 2025')

    const readTopValues = async (limit: number) => {
      const rows = await getRowsLocator(populationPage)
      const count = Math.min(await rows.count(), limit)
      const values: number[] = []
      for (let i = 0; i < count; i++) {
        const text = (await rows.nth(i).locator('td').nth(columnIndex).textContent()) || ''
        values.push(parseNumber(text))
      }
      return values
    }
    const assertNonIncreasing = (values: number[]) => {
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeLessThanOrEqual(values[i - 1])
      }
    }

    await test.step('sort by population ascending', async () => {
      await populationPage.sortBy('Population 2025', 'asc')
    })
    let ascValues: number[] = []
    await test.step('read top population values (asc)', async () => {
      ascValues = await readTopValues(5)
    })
    await test.step('log ascending values', async () => {
      console.log('Ascending values:', ascValues)
    })
    await test.step('assert ascending order', async () => {
      assertNonIncreasing(ascValues)
    })

    await test.step('sort by population descending', async () => {
      await populationPage.sortBy('Population 2025', 'desc')
    })
    let descValues: number[] = []
    await test.step('read top population values (desc)', async () => {
      descValues = await readTopValues(5)
    })
    await test.step('assert descending order', async () => {
      assertNonIncreasing(descValues)
    })
  })
})
