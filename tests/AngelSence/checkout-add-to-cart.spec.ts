import { test, expect } from '@playwright/test'
import { CheckOutPage } from '../../Pages/check-out-page'

test.describe('Checkout (add-to-cart=1450714) UI tests', () => {
  const testCustomer = {
    email: 'amielpeled@gmail.com',
    firstName: 'amiel',
    lastName: 'peled',
    phone: '0549988754',
    country: 'Canada',
    address1: '123 Main St',
    address2: 'Apt 1',
    province: 'Ontario',
    city: 'Toronto',
    postalCode: 'M5A 1A1'
  }

  const invalidCard = { type: 'card', number: '123412341234', expiry: '10/30', cvv: '123' }

  test.beforeEach(async ({ page }) => {
    await page.goto('/checkout/?add-to-cart=1450714')
  })

  test('checkout page loads and contains add-to-cart param', async ({ page }) => {
    await test.step('verify URL includes add-to-cart param', async () => {
      await expect(page).toHaveURL(/checkout\/\?add-to-cart=1450714/)
    })
    await test.step('verify page title', async () => {
      await expect(page).toHaveTitle('AngelSense GPS Tracker | Purchase Today')
    })
  })

  test('shows error when submitting invalid credit card', async ({ page }) => {
    const checkoutPage = new CheckOutPage(page)
    await test.step('fill email', async () => {
      await checkoutPage.setEmail(testCustomer.email)
    })
    await test.step('fill first name', async () => {
      await checkoutPage.setFirstname(testCustomer.firstName)
    })
    await test.step('fill last name', async () => {
      await checkoutPage.setLastName(testCustomer.lastName)
    })
    await test.step('fill phone', async () => {
      await checkoutPage.setPhone(testCustomer.phone)
    })
    await test.step('select country', async () => {
      await checkoutPage.selectCountry(testCustomer.country)
    })
    await test.step('fill address line 1', async () => {
      await checkoutPage.setAddress1(testCustomer.address1)
    })
    await test.step('fill address line 2', async () => {
      await checkoutPage.setAddress2(testCustomer.address2)
    })
    await test.step('select province', async () => {
      await checkoutPage.selectProvince(testCustomer.province)
    })
    await test.step('fill city', async () => {
      await checkoutPage.setCity(testCustomer.city)
    })
    await test.step('fill postal code', async () => {
      await checkoutPage.setPostalCode(testCustomer.postalCode)
    })
    await test.step('select shipping method', async () => {
      await checkoutPage.chooseShippingByKey('express')
    })
    await test.step('select payment method', async () => {
      // @ts-ignore
      await checkoutPage.choosePaymentMethod(
        invalidCard.type,
        invalidCard.number,
        invalidCard.expiry,
        invalidCard.cvv
      )
    })
    await test.step('agree to terms', async () => {
      await checkoutPage.clickAgreeToTerms()
    })
    await test.step('submit and validate error', async () => {
      await checkoutPage.clickPlaceOrder()
      const err = page.getByText('The card number is incomplete.')
      await expect(err).toBeVisible({ timeout: 10_000 })
    })
  })
})
