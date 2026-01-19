import test from '../../Fixtures/testSetup'
import { expect } from '@playwright/test'

test.describe('Population by Country - Consent Handling', () => {
  test('consent overlay does not block interactions', async ({ populationPage }) => {
    test.setTimeout(100000)

    await populationPage.goto()
    await populationPage.page.reload({ waitUntil: 'domcontentloaded' })
    await populationPage.waitForReady()

    await populationPage.setSearch('India')
    await expect(populationPage.rowByCountry('India')).toBeVisible()
  })
})
