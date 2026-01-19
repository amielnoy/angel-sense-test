// Page object for the Home Page
import { expect, Page, Locator } from '@playwright/test'

export class CheckOutPage {
    readonly email: Locator
    readonly firstName: Locator
    readonly lastName: Locator
    readonly phone: Locator
    readonly sheepingAddress1: Locator
    readonly sheepingAddress2: Locator
    readonly city: Locator
    readonly zipCode: Locator
    readonly terms: Locator
    constructor(private page: Page) {
        this.email = this.page.locator('#shipping_email');
        this.firstName = this.page.locator('#shipping_first_name');
        this.lastName = this.page.locator('#shipping_last_name');
        this.phone = this.page.locator('#shipping_phone');
        this.sheepingAddress1=this.page.locator('#shipping_address_1');
        this.sheepingAddress2=this.page.locator('#shipping_address_2');
        this.city = this.page.locator('#shipping_city');
        this.zipCode = this.page.locator('#shipping_postcode');
        this.terms=this.page.locator('.woocommerce-form__label.woocommerce-form__label-for-checkbox.checkbox').nth(1);
    }



    async setEmail(email: string) {
        await this.email.fill(email)
    }

    async validateEmail(){
        const emailError = await this.page.getByText('Please enter a valid email address');
        await expect(emailError).toBeVisible();
    }

    async setFirstname(email: string) {
        await this.firstName.fill(email)
    }

    async setLastName(email: string) {
        await this.lastName.fill(email)
    }

    async setPhone(email: string) {
        await this.phone.fill(email)
    }

    async validatePhone(){
        // Trigger inline validation by blurring the field
        await this.phone.blur();
        const phoneError = this.page.getByText(/(Please enter a valid phone number|This field is required)/i);
        await expect(phoneError).toBeVisible();
    }

    async selectCountry(country: string){
        await this.page.selectOption('#shipping_country', { label: country });
    }

    async setAddress1(address1: string) {
        await this.sheepingAddress1.fill(address1)
    }

    async validateFieldNotEmpty(){
        const phoneError = await this.page.getByText('This field is required');
        await expect(phoneError).toBeVisible();
    }



    async validateAddressOneHasStreetAndNumber(){
        const phoneError = await this.page.getByText('Please enter street & house number');
        await expect(phoneError).toBeVisible();
    }

    async setAddress2(address2: string) {
        await this.sheepingAddress2.fill(address2)
    }

    async selectProvince(Province: string){
        await this.page.selectOption('#shipping_state', { label: Province });
    }

    async setCity(City: string){
        await this.city.fill(City);
    }

    async setPostalCode(PostalCode: string) {
        await this.zipCode.fill(PostalCode);
    }

    async setSameAsSheepingAddress(check: boolean) {
        await this.page.locator('#same_as_toggle').setChecked(check);
    }


    async chooseShippingByKey(key: string) {
        if(key=='free')
            key='free-shipping';
        else
            key='express3_5'

        const item = this.page.locator(`li[data-shipping="${key}"]`).first();

        if (await item.count()) {
            await item.click();
        }

    }

    async choosePaymentMethod(
        method:  'paypal' | 'card' | 'apple' | 'google',
        cardNumber?:string,
        expiryDate?:string,
        cvc?:string
    ) {
        const scope = this.page.locator('#payment');
        await expect(scope).toBeVisible({ timeout: 60_000 });
        await expect(scope.locator('li.wc_payment_method')).toHaveCount(4);

        // Normalize aliases -> actual input value
        const map: Record<string, 'stripe' | 'paypal' | 'stripe_googlepay' | 'stripe_applepay'> = {
            card: 'stripe',
            paypal: 'paypal',
            google: 'stripe_googlepay',
            apple: 'stripe_applepay',
        };
        const value = map[method];
        if (!value) {
            throw new Error(`Unsupported payment method: ${method}`);
        }

        // 1) Try direct check by input value (fast)
        const input = scope.locator(`input[name="payment_method"][value="${value}"]`).first();
        if (await input.count()) {
            // If hidden, click label instead of .check()
            if (await input.isVisible()) {
                await input.check();
            } else {
                const id = await input.getAttribute('id');
                await scope.locator(`label[for="${id}"]`).click();
            }
            await expect(input).toBeChecked();
            if(method==='card'){
                // if (!cardNumber || !expiryDate || !cvc) {
                //     throw new Error('Card details are required when using the card payment method');
                // }
                const cardFrame = this.page.frameLocator('iframe[title="Secure card number input frame"]');
                await cardFrame.getByLabel(/credit or debit card number/i).fill(cardNumber);

                const expFrame = this.page.frameLocator('iframe[title="Secure expiration date input frame"]');
                await expFrame.getByLabel(/credit or debit card expiration date/i).fill(expiryDate);

                const cvcFrame = this.page.frameLocator('iframe[title="Secure CVC input frame"]');
                await cvcFrame.getByLabel(/cvc|cvv|security code/i).fill(cvc);
            }

        } else {
            // 2) Fallback by accessible name (label text)
            const nameMap: Record<typeof value, RegExp> = {
                stripe: /credit\s*card/i,
                paypal: /paypal/i,
                stripe_googlepay: /google\s*pay/i,
                stripe_applepay: /apple\s*pay/i,
            };
            const radio = scope.getByRole('radio', { name: nameMap[value], includeHidden: true }).first();
            await expect(radio).toHaveCount(1, { timeout: 30_000 });
            const id = await radio.getAttribute('id');
            await scope.locator(`label[for="${id}"]`).click();
            await expect(radio).toBeChecked();
        }

        // Optional: wait for the method-specific box to open (Stripe-type methods)
        const box = scope.locator(`.payment_box.payment_method_${value}`);
        if (await box.count()) {
            await expect(box).toBeVisible({ timeout: 10_000 }).catch(() => {});
        }

        // Sanity check: the checked value is the one we wanted
        await expect(scope.locator('input[name="payment_method"]:checked')).toHaveValue(value);
    }

    async clickAgreeToTerms()
    {
        await this.page.evaluate(() => {
            const el = document.querySelector('#terms') as HTMLInputElement | null;
            if (!el) throw new Error('terms checkbox not found');
            el.checked = true;
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        });
    }

    async clickPlaceOrder() {
        await this.page.locator('#place_order').click();
    }

    async validateAcceptTerms() {
        const termsError = await this.page.getByText('Please accept terms and conditions');
        await expect(termsError).toBeVisible()
    }
}
