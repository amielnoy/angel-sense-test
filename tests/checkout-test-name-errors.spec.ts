import test from '../Fixtures/testSetup'
import {expect} from "@playwright/test";
test.describe('checkout tests', () => {
    // Keep it self-contained: set a baseURL for this describe block

    test.beforeEach(async ({page}) => {
        await page.goto('/checkout/?add-to-cart=1450714'); // resolves against baseURL
    });
    test('test add to cart empty first name', async ({
                                        checkoutPage,
                                    }) => {
        await checkoutPage.setEmail('amielpeled@gmail.com')
        await checkoutPage.setFirstname('')
        await checkoutPage.setLastName('peled')
        await checkoutPage.validateFieldNotEmpty()
        await checkoutPage.setPhone('0549988754')
        await checkoutPage.selectCountry('Canada')
        await checkoutPage.setAddress1('123 Main St')
        await checkoutPage.setAddress2('Apt 1')
        await checkoutPage.selectProvince('Ontario')
        await checkoutPage.setCity('Toronto')
        await checkoutPage.setPostalCode('M5A 1A1')
        await checkoutPage.setSameAsSheepingAddress(true)
        await checkoutPage.chooseShippingByKey('express')
        await checkoutPage.choosePaymentMethod('paypal')
        await checkoutPage.clickAgreeToTerms();
        await checkoutPage.clickPlaceOrder()
        console.log('debug')
        //expect().toBeGreaterThan(8.0)
    })

    test('test add to cart empty last name', async ({
                                                                      checkoutPage,
                                                                  }) => {
        await checkoutPage.setEmail('amielpeled@gmail.com')
        await checkoutPage.setFirstname('amiel')
        await checkoutPage.setLastName('')
        await checkoutPage.setPhone('0549988754')
        await checkoutPage.validateFieldNotEmpty()
        await checkoutPage.selectCountry('Canada')
        await checkoutPage.setAddress1('123 Main St')
        await checkoutPage.setAddress2('Apt 1')
        await checkoutPage.selectProvince('Ontario')
        await checkoutPage.setCity('Toronto')
        await checkoutPage.setPostalCode('M5A 1A1')
        await checkoutPage.setSameAsSheepingAddress(true)
        await checkoutPage.chooseShippingByKey('express')
        await checkoutPage.choosePaymentMethod('card','123412341234','10/30','123')
        await checkoutPage.clickAgreeToTerms();
        await checkoutPage.clickPlaceOrder()
        console.log('debug')
        //expect().toBeGreaterThan(8.0)
    })
})
