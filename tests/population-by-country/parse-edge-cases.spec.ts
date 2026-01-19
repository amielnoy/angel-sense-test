import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'
import { normalizeNumberText, parseNumber } from './utils'

test.describe('Population by Country - Parse Edge Cases #TableTests', () => {
  test('numeric parsing handles unicode minus and non-breaking spaces', async ({ populationPage }) => {
    test.setTimeout(100000)
    const collectValues = (rows: Record<string, string>[]) =>
      rows
        .flatMap(row => [row['Yearly Change'], row['Net Change'], row['Migrants (net)']])
        .filter((value): value is string => Boolean(value))
    const assertParsable = (samples: string[]) => {
      for (const raw of samples) {
        const normalized = normalizeNumberText(raw)
        const parsed = parseNumber(normalized)
        expect(Number.isNaN(parsed)).toBe(false)
      }
    }
    await test.step('navigate to population table', async () => {
      await populationPage.goto()
    })
    let rows: Awaited<ReturnType<typeof populationPage.getTableData>> = []
    await test.step('read table data', async () => {
      rows = await populationPage.getTableData(50)
    })
    let values: string[] = []
    await test.step('collect numeric fields', async () => {
      values = collectValues(rows)
    })
    let samples: string[] = []
    await test.step('select sample values', async () => {
      const specialValues = values.filter(v => /[\u2212\u00a0]/.test(v))
      samples = specialValues.length > 0 ? specialValues : values.slice(0, 10)
    })
    await test.step('assert sample size', async () => {
      expect(samples.length).toBeGreaterThan(0)
    })
    await test.step('assert values parse as numbers', async () => {
      assertParsable(samples)
    })
  })
})
