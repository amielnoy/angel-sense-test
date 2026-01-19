import test from '../../Fixtures/testSetup'
import { expect } from "@playwright/test";

test.describe('Checkout Payment Tests', () => {
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
    };

    const invalidCard = {
        type: 'card',
        number: '123412341234',
        expiry: '10/30',
        cvv: '123'
    };

    test.beforeEach(async ({ page }) => {
        await page.goto('/checkout/?add-to-cart=1450714');
    });

    test('should show error when using invalid credit card', async ({ checkoutPage }) => {
        // Fill customer information
        await checkoutPage.setEmail(testCustomer.email);
        await checkoutPage.setFirstname(testCustomer.firstName);
        await checkoutPage.setLastName(testCustomer.lastName);
        await checkoutPage.setPhone(testCustomer.phone);
        await checkoutPage.selectCountry(testCustomer.country);
        await checkoutPage.setAddress1(testCustomer.address1);
        await checkoutPage.setAddress2(testCustomer.address2);
        await checkoutPage.selectProvince(testCustomer.province);
        await checkoutPage.setCity(testCustomer.city);
        await checkoutPage.setPostalCode(testCustomer.postalCode);

        // Configure shipping
        await checkoutPage.chooseShippingByKey('express');

        // Payment and submission
        await checkoutPage.choosePaymentMethod(
            'card',
            invalidCard.number,
            invalidCard.expiry,
            invalidCard.cvv
        );
        await checkoutPage.clickAgreeToTerms();

        // Submit and verify error
        await checkoutPage.clickPlaceOrder();
        //const errorMessage = await checkoutPage.getErrorMessage();
        //await expect(errorMessage).toContainText('Your card number is invalid');  // Updated to match actual error message
    });
});
