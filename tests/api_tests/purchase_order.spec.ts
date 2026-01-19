// ...existing code...
import test from '../../Fixtures/testSetup';
import { expect } from '@playwright/test';

test.describe('Purchase API Tests #PurchaseOrder', () => {
  test('should create a purchase order successfully', async ({ apiHelpers }) => {
    const orderData = {
      payment_method: 'stripe',
      payment_method_title: 'Credit Card',
      billing: {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '0549988754',
        address_1: '123 Main St',
        city: 'Toronto',
        state: 'ON',
        postcode: 'M5A1A1',
        country: 'CA'
      },
      shipping: {
        first_name: 'John',
        last_name: 'Doe',
        address_1: '123 Main St',
        city: 'Toronto',
        state: 'ON',
        postcode: 'M5A1A1',
        country: 'CA'
      },
      line_items: [{ product_id: 1450714, quantity: 1 }]
    };

    const response = await test.step('create purchase order', async () => {
      return apiHelpers.createOrder(orderData);
    })
    await test.step('assert response status', async () => {
      expect(response.status).toBe(201);
    })
    await test.step('assert order id', async () => {
      expect(response.data?.id).toBeTruthy();
    })
  });
});
// ...existing code...
