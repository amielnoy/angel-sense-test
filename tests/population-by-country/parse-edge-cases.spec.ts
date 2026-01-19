import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'
import { normalizeNumberText, parseNumber } from './utils'

test.describe('Population by Country - Parse Edge Cases', () => {
  test('numeric parsing handles unicode minus and non-breaking spaces', async ({ populationPage }) => {
    test.setTimeout(100000)
    await populationPage.goto()

    const rows = await populationPage.getTableData(50)
    const values = rows.flatMap(row => [row['Yearly Change'], row['Net Change'], row['Migrants (net)']])
      .filter((value): value is string => Boolean(value))

    const specialValues = values.filter(v => /[\u2212\u00a0]/.test(v))
    const samples = specialValues.length > 0 ? specialValues : values.slice(0, 10)

    expect(samples.length).toBeGreaterThan(0)

    for (const raw of samples) {
      const normalized = normalizeNumberText(raw)
      const parsed = parseNumber(normalized)
      expect(Number.isNaN(parsed)).toBe(false)
    }
  })
})
