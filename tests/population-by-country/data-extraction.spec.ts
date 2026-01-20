import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'
import { normalizeNumberText, parseNumber } from './utils'

test.describe('Population by Country - Data Extraction #TableTests', () => {
  test('UI data matches HTML fallback for sampled rows', async ({ populationPage }) => {
    test.setTimeout(100000)
    const countMatches = async (
      uiRows: Record<string, string>[],
      htmlRows: Record<string, string>[],
      sampleSize: number,
    ) => {
      const normalizeCountry = (value: string | undefined) =>
        normalizeNumberText((value || '').replace(/\s+/g, ' ')).toLowerCase()

      let matches = 0
      for (let i = 0; i < sampleSize; i++) {
        const ui = await test.step(`row ${i + 1}: get UI row`, async () => uiRows[i])
        const htmlRow = await test.step(`row ${i + 1}: get HTML row`, async () => htmlRows[i])
        const uiCountry = await test.step(`row ${i + 1}: normalize UI country`, async () =>
          normalizeCountry(ui['Country (or dependency)']),
        )
        const htmlCountry = await test.step(`row ${i + 1}: normalize HTML country`, async () =>
          normalizeCountry(htmlRow['Country (or dependency)']),
        )
        const uiPop = await test.step(`row ${i + 1}: parse UI population`, async () =>
          parseNumber(ui['Population 2025'] || ''),
        )
        const htmlPop = await test.step(`row ${i + 1}: parse HTML population`, async () =>
          parseNumber(htmlRow['Population 2025'] || ''),
        )
        const uiYearly = await test.step(`row ${i + 1}: parse UI yearly change`, async () =>
          parseNumber(ui['Yearly Change'] || ''),
        )
        const htmlYearly = await test.step(`row ${i + 1}: parse HTML yearly change`, async () =>
          parseNumber(htmlRow['Yearly Change'] || ''),
        )

        const isMatch = await test.step(`row ${i + 1}: compare row values`, async () => {
          return uiCountry === htmlCountry && uiPop === htmlPop && uiYearly === htmlYearly
        })
        await test.step(`row ${i + 1}: update match count`, async () => {
          if (isMatch) {
            matches++
          }
        })
      }
      return matches
    }
    await test.step('navigate to population table', async () => {
      await populationPage.goto()
    })

    let uiRows: Awaited<ReturnType<typeof populationPage.getTableData>> = []
    await test.step('capture UI table data', async () => {
      uiRows = await populationPage.getTableData(50)
    })
    let html: string | null = null
    await test.step('fetch HTML table', async () => {
      html = await populationPage.fetchTableHtml()
    })
    await test.step('assert HTML table exists', async () => {
      expect(html).not.toBeNull()
    })
    let htmlRows: Awaited<ReturnType<typeof populationPage.parseTableHtml>> = []
    await test.step('parse HTML table data', async () => {
      htmlRows = html ? populationPage.parseTableHtml(html, 50) : []
    })

    let sampleSize = 0
    await test.step('compute sample size', async () => {
      sampleSize = Math.min(10, uiRows.length, htmlRows.length)
    })
    await test.step('assert sample size is valid', async () => {
      expect(sampleSize).toBeGreaterThan(0)
    })

    let matches = 0
    await test.step('compare sampled rows', async () => {
      matches = await countMatches(uiRows, htmlRows, sampleSize)
    })
    await test.step('assert match ratio', async () => {
      expect(matches / sampleSize).toBeGreaterThanOrEqual(0.95)
    })
  })
})
