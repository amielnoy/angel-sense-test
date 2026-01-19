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
    await expect(page).toHaveURL(/checkout\/\?add-to-cart=1450714/)
    await expect(page).toHaveTitle('AngelSense GPS Tracker | Purchase Today')
  })

  test('shows error when submitting invalid credit card', async ({ page }) => {
    // Fill customer information
    const checkoutPage = new CheckOutPage(page)
    await checkoutPage.setEmail(testCustomer.email)
    await checkoutPage.setFirstname(testCustomer.firstName)
    await checkoutPage.setLastName(testCustomer.lastName)
    await checkoutPage.setPhone(testCustomer.phone)
    await checkoutPage.selectCountry(testCustomer.country)
    await checkoutPage.setAddress1(testCustomer.address1)
    await checkoutPage.setAddress2(testCustomer.address2)
    await checkoutPage.selectProvince(testCustomer.province)
    await checkoutPage.setCity(testCustomer.city)
    await checkoutPage.setPostalCode(testCustomer.postalCode)

    // Shipping & payment
    await checkoutPage.chooseShippingByKey('express')
    // @ts-ignore
    await checkoutPage.choosePaymentMethod(
      invalidCard.type,
      invalidCard.number,
      invalidCard.expiry,
      invalidCard.cvv
    )
    await checkoutPage.clickAgreeToTerms()
    await checkoutPage.clickPlaceOrder()

    // Verify UI shows a payment error message
    const err = page.getByText('The card number is incomplete.')
    await expect(err).toBeVisible({ timeout: 10_000 })
  })
})
