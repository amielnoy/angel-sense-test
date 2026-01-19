import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'
import PopulationByCountryPage from '../../Pages/worldometers-population-page'

test.describe('Population by Country - Performance #TableTests', () => {
  test('table becomes ready within threshold and row count is reasonable', async ({ populationPage }) => {

    let elapsedMs = 0
    await test.step('start timer', async () => {
      elapsedMs = Date.now()
    })
    await test.step('navigate to population table', async () => {
      await populationPage.page.goto(PopulationByCountryPage.url, { waitUntil: 'domcontentloaded' })
    })
    await test.step('wait for table to be ready', async () => {
      await populationPage.waitForReady()
    })
    await test.step('stop timer', async () => {
      elapsedMs = Date.now() - elapsedMs
    })
    await test.step('assert ready time threshold', async () => {
      expect(elapsedMs).toBeLessThan(30_000)
    })

    let html: string | null = null
    await test.step('fetch HTML table', async () => {
      html = await populationPage.fetchTableHtml()
    })
    let htmlRows: ReturnType<typeof populationPage.parseTableHtml> = []
    await test.step('parse HTML rows', async () => {
      htmlRows = html ? populationPage.parseTableHtml(html) : []
    })
    let rowCount = 0
    await test.step('read row count', async () => {
      rowCount = htmlRows.length > 0 ? htmlRows.length : await populationPage.getRowCount()
    })
    await test.step('assert row count lower bound', async () => {
      expect(rowCount).toBeGreaterThan(220)
    })
    await test.step('assert row count upper bound', async () => {
      expect(rowCount).toBeLessThan(260)
    })
  })
})
