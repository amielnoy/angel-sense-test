import test from '../../Fixtures/testSetup'
import {expect} from "@playwright/test";
test.describe('checkout tests', () => {
    // Keep it self-contained: set a baseURL for this describe block

    test.beforeEach(async ({page}) => {
        await page.goto('/checkout/?add-to-cart=1450714'); // resolves against baseURL
    });
    test('test add to cart empty address1', async ({
                                        checkoutPage,
                                    }) => {
        await test.step('fill customer details and trigger address validation', async () => {
            await checkoutPage.setEmail('amielpeled@gmail.com')
            await checkoutPage.setFirstname('amiel')
            await checkoutPage.setLastName('peled')
            await checkoutPage.setPhone('0549988754')
            await checkoutPage.selectCountry('Canada')
            await checkoutPage.setAddress1('')
            await checkoutPage.setAddress2('Apt 1')
            await checkoutPage.validateFieldNotEmpty()
        })
        await test.step('fill remaining address fields and payment', async () => {
            await checkoutPage.selectProvince('Ontario')
            await checkoutPage.setCity('Toronto')
            await checkoutPage.setPostalCode('M5A 1A1')
            await checkoutPage.setSameAsSheepingAddress(true)
            await checkoutPage.chooseShippingByKey('express')
            await checkoutPage.choosePaymentMethod('paypal')
            await checkoutPage.clickAgreeToTerms();
        })
        await test.step('submit order', async () => {
            await checkoutPage.clickPlaceOrder()
        })
        console.log('debug')
        //expect().toBeGreaterThan(8.0)
    })

    test('test add to cart wrong address1 number', async ({
                                                                      checkoutPage,
                                                                  }) => {
        await test.step('fill customer details and trigger address validation', async () => {
            await checkoutPage.setEmail('amielpeled@gmail.com')
            await checkoutPage.setFirstname('amiel')
            await checkoutPage.setLastName('peled')
            await checkoutPage.setPhone('0549988754')
            await checkoutPage.selectCountry('Canada')
            await checkoutPage.setAddress1('123')
            await checkoutPage.setAddress2('Apt 1')
            await checkoutPage.validateAddressOneHasStreetAndNumber()
        })
        await test.step('fill remaining address fields and payment', async () => {
            await checkoutPage.selectProvince('Ontario')
            await checkoutPage.setCity('Toronto')
            await checkoutPage.setPostalCode('M5A 1A1')
            await checkoutPage.setSameAsSheepingAddress(true)
            await checkoutPage.chooseShippingByKey('express')
            await checkoutPage.choosePaymentMethod('card','123412341234','10/30','123')
            await checkoutPage.clickAgreeToTerms();
        })
        await test.step('submit order', async () => {
            await checkoutPage.clickPlaceOrder()
        })
        console.log('debug')
        //expect().toBeGreaterThan(8.0)
    })
})
