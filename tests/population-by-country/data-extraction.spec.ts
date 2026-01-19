import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'
import { normalizeNumberText, parseNumber } from './utils'

test.describe('Population by Country - Data Extraction #TableTests', () => {
  test('UI data matches HTML fallback for sampled rows', async ({ populationPage }) => {
    test.setTimeout(100000)
    await test.step('navigate to population table', async () => {
      await populationPage.goto()
    })

    const { uiRows, htmlRows } = await test.step('capture UI and HTML table data', async () => {
      const ui = await populationPage.getTableData(50)
      const html = await populationPage.fetchTableHtml()
      expect(html).not.toBeNull()
      const parsed = html ? populationPage.parseTableHtml(html, 50) : []
      return { uiRows: ui, htmlRows: parsed }
    })

    await test.step('compare sampled rows between UI and HTML', async () => {
      const sampleSize = Math.min(10, uiRows.length, htmlRows.length)
      expect(sampleSize).toBeGreaterThan(0)

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

      expect(matches / sampleSize).toBeGreaterThanOrEqual(0.95)
    })
  })
})
