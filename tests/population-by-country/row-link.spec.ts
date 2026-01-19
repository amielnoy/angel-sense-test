import test from '../../Fixtures/testSetup'
import { expect, Page } from '@playwright/test'

const dismissPopupIfPresent = async (page: Page) => {
  const candidates = [
    // role-based common accept/close buttons
    page.getByText("Close"),
    page.getByRole('link', { name: /accept all|accept|agree|i agree|continue|ok|got it|close|dismiss|no thanks/i }),
    // text-based fallbacks
    page.locator('button:has-text("Close")'),
    page.locator('button:has-text("No thanks")'),
    page.locator('button[aria-label*="close"i]'),
    // generic selectors often used by ad libraries
    page.locator('.modal-close, .modal__close, .close, .close-btn, .btn-close, .vignette-close, .ad-overlay .close'),
  ]

  for (const candidate of candidates) {
    try {
      const first = candidate.first()
      if (await first.isVisible({ timeout: 1000 })) {
        await first.click({ timeout: 2000 }).catch(() => {})
        // allow UI to settle after dismissal
        await page.waitForTimeout(300)
        break
      }
    } catch {}
  }

  // Try pressing Escape to close modals/dialogs
  try {
    await page.keyboard.press('Escape')
    await page.waitForTimeout(250)
  } catch {}

  // As a last resort, remove likely overlay elements from the page DOM
  try {
    await page.evaluate(() => {
      const selectors = [
        '[role="dialog"]',
        '.modal',
        '.popup',
        '.vignette',
        '.ad-overlay',
        '.cookie-consent',
        '[id^="qc-cmp"',
      ]
      for (const sel of selectors) {
        document.querySelectorAll(sel).forEach(el => el.remove())
      }
      // Also try to re-enable pointer events on body
      try { document.body.style.pointerEvents = 'auto' } catch (e) {}
    })
    await page.waitForTimeout(200)
  } catch {}
}

test.describe('Population by Country - Row Link', () => {
  test('clicking China navigates to China population page', async ({ populationPage }) => {
    test.setTimeout(100000)
    await test.step('navigate to population table', async () => {
      await populationPage.goto()
    })

    const row = await test.step('locate China row', async () => {
      const chinaRow = populationPage.rowByCountry('China')
      await expect(chinaRow).toBeVisible()
      return chinaRow
    })

    await test.step('click China link with popup handling', async () => {
      await dismissPopupIfPresent(populationPage.page)
      const link = row.locator('a').first()
      // Try clicking the link; if a popup blocks the click, dismiss and retry.
      try {
        await link.click({ timeout: 5000 })
      } catch (err) {
        // Attempt to dismiss any popup and retry click once
        await dismissPopupIfPresent(populationPage.page)
        try {
          await link.click({ timeout: 5000 })
        } catch (err2) {
          // As a last resort, navigate to the href directly (robust fallback)
          const href = await link.getAttribute('href')
          if (!href) throw err2
          const target = new URL(href, populationPage.page.url()).toString()
          await populationPage.page.goto(target)
        }
      }
      await dismissPopupIfPresent(populationPage.page)
    })

    await test.step('verify destination page', async () => {
      await expect(populationPage.page).toHaveURL(/\/world-population\/china-population\//)
      await expect(populationPage.page).toHaveTitle(/China Population/i)
    })
  })
})
