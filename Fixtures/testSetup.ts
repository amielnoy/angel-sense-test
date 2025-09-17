import {test as base} from '@playwright/test'
import {CheckOutPage} from "../Pages/check-out-page";

interface ITestFixtures {
    checkoutPage: CheckOutPage;
}

const test = base.extend<ITestFixtures>({

    checkoutPage: async ({page}, use) => {
    const checkoutPage = new CheckOutPage(page)
    await use(checkoutPage)
  },
})

export default test
