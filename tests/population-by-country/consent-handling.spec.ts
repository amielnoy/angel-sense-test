import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'

test.describe('Population by Country - Consent Handling #TableTests', () => {
  test('consent overlay does not block interactions', async ({ populationPage }) => {
    test.setTimeout(100000)

    await test.step('navigate and reload page', async () => {
      await populationPage.goto()
      await populationPage.page.reload({ waitUntil: 'domcontentloaded' })
      await populationPage.waitForReady()
    })
    await test.step('verify search remains usable', async () => {
      await populationPage.setSearch('India')
      await expect(populationPage.rowByCountry('India')).toBeVisible()
    })
  })
})
