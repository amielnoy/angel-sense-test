import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'
import { normalizeNumberText, parseNumber } from './utils'

test.describe('Population by Country - Data Extraction #TableTests', () => {
  test('UI data matches HTML fallback for sampled rows', async ({ populationPage }) => {
    test.setTimeout(100000)
    const countMatches = (uiRows: Record<string, string>[], htmlRows: Record<string, string>[], sampleSize: number) => {
      const normalizeCountry = (value: string | undefined) =>
        normalizeNumberText((value || '').replace(/\s+/g, ' ')).toLowerCase()

      let matches = 0
      for (let i = 0; i < sampleSize; i++) {
        const ui = uiRows[i]
        const htmlRow = htmlRows[i]
        const uiCountry = normalizeCountry(ui['Country (or dependency)'])
        const htmlCountry = normalizeCountry(htmlRow['Country (or dependency)'])
        const uiPop = parseNumber(ui['Population 2025'] || '')
        const htmlPop = parseNumber(htmlRow['Population 2025'] || '')
        const uiYearly = parseNumber(ui['Yearly Change'] || '')
        const htmlYearly = parseNumber(htmlRow['Yearly Change'] || '')

        if (uiCountry === htmlCountry && uiPop === htmlPop && uiYearly === htmlYearly) {
          matches++
        }
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
      matches = countMatches(uiRows, htmlRows, sampleSize)
    })
    await test.step('assert match ratio', async () => {
      expect(matches / sampleSize).toBeGreaterThanOrEqual(0.95)
    })
  })
})
