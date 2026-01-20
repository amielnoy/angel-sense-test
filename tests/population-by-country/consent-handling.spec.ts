import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'

test.describe('Population by Country - Consent Handling #TableTests', () => {
  test('consent overlay does not block interactions', async ({ populationPage }) => {
    test.setTimeout(100000)

    await test.step('navigate to population table', async () => {
      await populationPage.goto()
    })
    await test.step('reload page', async () => {
      await populationPage.page.reload({ waitUntil: 'domcontentloaded' })
    })
    await test.step('wait for table to be ready', async () => {
      try {
        await populationPage.waitForReady()
      } catch {
        await populationPage.goto()
        await populationPage.waitForReady()
      }
    })
    await test.step('set search term', async () => {
      await populationPage.setSearch('India')
    })
    await test.step('assert India row visible', async () => {
      await expect(populationPage.rowByCountry('India')).toBeVisible()
    })
  })
})
