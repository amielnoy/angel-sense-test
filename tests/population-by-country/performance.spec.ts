import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'
import PopulationByCountryPage from '../../Pages/worldometers-population-page'

test.describe('Population by Country - Performance', () => {
  test('table becomes ready within threshold and row count is reasonable', async ({ populationPage }) => {
    test.setTimeout(100000)

    const elapsedMs = await test.step('navigate and measure ready time', async () => {
      const start = Date.now()
      await populationPage.page.goto(PopulationByCountryPage.url, { waitUntil: 'domcontentloaded' })
      await populationPage.waitForReady()
      return Date.now() - start
    })
    await test.step('assert ready time threshold', async () => {
      expect(elapsedMs).toBeLessThan(30_000)
    })

    await test.step('assert row count range', async () => {
      const html = await populationPage.fetchTableHtml()
      const htmlRows = html ? populationPage.parseTableHtml(html) : []
      const rowCount = htmlRows.length > 0 ? htmlRows.length : await populationPage.getRowCount()

      expect(rowCount).toBeGreaterThan(220)
      expect(rowCount).toBeLessThan(260)
    })
  })
})
