import { test, expect } from '@playwright/test';

test.describe('Test group', () => {
  test('seed', async ({ page }) => {
    await test.step('placeholder step', async () => {
      // generate code here.
    })
  });
});
