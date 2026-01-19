import test from '../../Fixtures/testSetup'
import {expect} from "@playwright/test";
test.describe('checkout tests', () => {
    // Keep it self-contained: set a baseURL for this describe block

    test.beforeEach(async ({page}) => {
        await page.goto('/checkout/?add-to-cart=1450714'); // resolves against baseURL
    });
    test('test add to cart empty first name', async ({
                                        checkoutPage,
                                    }) => {
        await test.step('fill email', async () => {
            await checkoutPage.setEmail('amielpeled@gmail.com')
        })
        await test.step('fill first name', async () => {
            await checkoutPage.setFirstname('amiel')
        })
        await test.step('fill last name', async () => {
            await checkoutPage.setLastName('peled')
        })
        await test.step('fill phone', async () => {
            await checkoutPage.setPhone('0549988754')
        })
        await test.step('select country', async () => {
            await checkoutPage.selectCountry('Canada')
        })
        await test.step('fill address line 1', async () => {
            await checkoutPage.setAddress1('123 Main St')
        })
        await test.step('fill address line 2', async () => {
            await checkoutPage.setAddress2('Apt 1')
        })
        await test.step('select province', async () => {
            await checkoutPage.selectProvince('Ontario')
        })
        await test.step('fill city', async () => {
            await checkoutPage.setCity('Toronto')
        })
        await test.step('fill postal code', async () => {
            await checkoutPage.setPostalCode('M5A 1A1')
        })
        await test.step('set same as shipping address', async () => {
            await checkoutPage.setSameAsSheepingAddress(true)
        })
        await test.step('select shipping method', async () => {
            await checkoutPage.chooseShippingByKey('express')
        })
        await test.step('select payment method', async () => {
            await checkoutPage.choosePaymentMethod('paypal')
        })
        await test.step('submit order without accepting terms', async () => {
            await checkoutPage.clickPlaceOrder()
        })
        await test.step('validate terms error', async () => {
            await checkoutPage.validateAcceptTerms()
        })
        console.log('debug')
        //expect().toBeGreaterThan(8.0)
    })
})
