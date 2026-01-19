import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'
import { getHeaderIndex, getRowsLocator, parseNumber } from './utils'

test.describe('Population by Country - Sort Numeric', () => {
  test('population column sorts ascending and descending', async ({ populationPage }) => {
    test.setTimeout(100000)
    await populationPage.goto()

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

    await populationPage.sortBy('Population 2025', 'asc')
    const ascValues = await readTopValues(5)
    for (let i = 1; i < ascValues.length; i++) {
      expect(ascValues[i]).toBeGreaterThanOrEqual(ascValues[i - 1])
    }

    await populationPage.sortBy('Population 2025', 'desc')
    const descValues = await readTopValues(5)
    for (let i = 1; i < descValues.length; i++) {
      expect(descValues[i]).toBeLessThanOrEqual(descValues[i - 1])
    }
  })
})
