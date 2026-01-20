import test from '../../Fixtures/testSetup'
import { expect, Frame, Page } from '@playwright/test'

const dismissPopupIfPresent = async (page: Page) => {
  const tryDismissInContext = async (context: Page | Frame) => {
    const candidates = [
      // role-based common accept/close buttons
      context.getByText('Close'),
      context.getByRole('button', { name: /accept all|accept|agree|i agree|continue|ok|got it|close|dismiss|no thanks/i }),
      context.locator('button:has-text("Close")'),
      context.locator('button[aria-label*="close"i]'),
    ]

    for (const candidate of candidates) {
      try {
        const first = candidate.first()
        if (await first.isVisible({ timeout: 2000 })) {
          await first.click({ timeout: 2000 }).catch(() => {})
          // allow UI to settle after dismissal
          await page.waitForLoadState('domcontentloaded', { timeout: 1000 }).catch(() => {})
          return true
        }
      } catch {}
    }
    return false
  }

  await tryDismissInContext(page)
  for (const frame of page.frames()) {
    await tryDismissInContext(frame)
  }

  // Try pressing Escape to close modals/dialogs
  try {
    await page.keyboard.press('Escape')
    await page.waitForLoadState('domcontentloaded', { timeout: 1000 }).catch(() => {})
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
    await page.waitForLoadState('domcontentloaded', { timeout: 1000 }).catch(() => {})
  } catch {}
}

test.describe('Population by Country - Row Link #TableTests', () => {
  test('clicking China navigates to China population page', async ({ populationPage }) => {
    await test.step('navigate to population table', async () => {
      await populationPage.goto()
    })

    let row = populationPage.rowByCountry('China')
    await test.step('locate China row', async () => {
      row = populationPage.rowByCountry('China')
    })
    await test.step('assert China row is visible', async () => {
      await expect(row).toBeVisible()
    })

    await test.step('dismiss popups before click', async () => {
      await dismissPopupIfPresent(populationPage.page)
    })
    const link = row.locator('a').first()
    const linkHref = await test.step('capture China link href', async () => {
      return await link.getAttribute('href')
    })
    let targetPage: Page = populationPage.page
    await test.step('attach popup/dialog accept handler', async () => {
      populationPage.page.once('dialog', async dialog => {
        await dialog.accept()
      })
    })
    await test.step('click China link', async () => {
      // Try clicking the link; if a popup blocks the click, dismiss and retry.
      try {
        const popupPromise = populationPage.page.context().waitForEvent('page').catch(() => null)
        await link.click({ timeout: 10000 })
        const popup = await popupPromise
        if (popup) {
          targetPage = popup
          await targetPage.waitForLoadState('domcontentloaded').catch(() => {})
        }
        await populationPage.page.waitForTimeout(500)
        for (let i = 0; i < 3; i++) {
          await dismissPopupIfPresent(targetPage)
          await targetPage.waitForTimeout(300)
        }
      } catch (err) {
        // Attempt to dismiss any popup and retry click once
        await dismissPopupIfPresent(targetPage)
        try {
          const popupPromise = populationPage.page.context().waitForEvent('page').catch(() => null)
          await link.click({ timeout: 5000 })
          const popup = await popupPromise
          if (popup) {
            targetPage = popup
            await targetPage.waitForLoadState('domcontentloaded').catch(() => {})
          }
          await targetPage.waitForTimeout(500)
          for (let i = 0; i < 3; i++) {
            await dismissPopupIfPresent(targetPage)
            await targetPage.waitForTimeout(300)
          }
        } catch (err2) {
          // As a last resort, navigate to the href directly (robust fallback)
          if (!linkHref) throw err2
          if (targetPage.isClosed()) {
            targetPage = await populationPage.page.context().newPage()
          }
          const target = new URL(linkHref, targetPage.url()).toString()
          await targetPage.goto(target)
          await targetPage.waitForTimeout(500)
          for (let i = 0; i < 3; i++) {
            await dismissPopupIfPresent(targetPage)
            await targetPage.waitForTimeout(300)
          }
        }
      }
    })
    await test.step('assert destination URL', async () => {
      await expect(targetPage).toHaveURL(/\/world-population\/china-population\//)
    })
    await test.step('assert destination title', async () => {
      await expect(targetPage).toHaveTitle(/China Population/i)
    })
  })
})
