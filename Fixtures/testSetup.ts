import { test as base } from '@playwright/test'
import 'dotenv/config'
import { CheckOutPage } from "../Pages/check-out-page";
import OrdersApiClient from "../api_helpers/orders/orders_client"
import VirusTotalClient from "../api_helpers/virustotal/virustotal_client";
import PopulationByCountryPage from "../Pages/worldometers-population-page";

interface ITestFixtures {
    checkoutPage: CheckOutPage;
    apiHelpers: OrdersApiClient;
    virustotal: VirusTotalClient;
    populationPage: PopulationByCountryPage;
}

const test = base.extend<ITestFixtures>({

    checkoutPage: async ({page}, use) => {
    const checkoutPage = new CheckOutPage(page)
    await use(checkoutPage)
  },
  apiHelpers: async ({ request }, use) => {
    const ordersApi = OrdersApiClient.fromEnv();
    await use(ordersApi);
  },
  virustotal: async ({}, use) => {
    const vt = new VirusTotalClient();
    await use(vt);
  },
  populationPage: async ({ page }, use) => {
    const p = new PopulationByCountryPage(page)
    await use(p)
  },
})

export default test
