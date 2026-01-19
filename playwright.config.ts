import {defineConfig, devices} from '@playwright/test'
import dotenv from 'dotenv'
import * as os from 'node:os'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */

dotenv.config({ path: '.env' });
export default defineConfig({
  testDir: './tests',
  /* test timeout */
  timeout: 120_000, // Increased to match test-specific timeouts (100000ms) with buffer
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0, // Reduced from 2 to 1 for faster CI
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 6 : 10, // Increased from 4 to 6 for faster execution
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI
    ? [
        ['line'],
        ['html', { open: 'never' }],
        [
          'allure-playwright',
          {
            resultsDir: 'allure-results',
            detail: true, // Keep detailed steps enabled
            suiteTitle: true,
            environmentInfo: {
              os_platform: os.platform(),
              os_release: os.release(),
              os_version: os.version(),
              node_version: process.version,
              base_url: process.env.BASE_URL || 'not set',
              ci: process.env.CI || 'false',
            },
          },
        ],
        // ReportPortal removed - add back when properly configured with RP_API_KEY, RP_ENDPOINT, RP_PROJECT env vars
        // ['@reportportal/agent-js-playwright'],
      ]
    : [
        ['line'],
        ['html', { open: 'always' }],
        [
          'allure-playwright',
          {
            resultsDir: 'allure-results',
            detail: true,
            suiteTitle: true,
            environmentInfo: {
              os_platform: os.platform(),
              os_release: os.release(),
              os_version: os.version(),
              node_version: process.version,
              base_url: process.env.BASE_URL || 'not set',
            },
          },
        ],
      ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.BASE_URL,
    viewport: { width: 1920, height: 920 }, // Full HD resolution
    headless: !!process.env.CI, // Run tests in headed mode (show browser UI)

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: process.env.CI ? 'on-first-retry' : 'on', // Only trace on retry in CI for performance
    screenshot: {
      mode: 'only-on-failure',
      fullPage: true,
    },
    video: 'retain-on-failure',
    testIdAttribute: 'data-testid',
    
    /* Network settings for CI stability */
    actionTimeout: 30_000, // Increase action timeout for slow networks
    navigationTimeout: 60_000, // Increase navigation timeout for external sites
  },
  outputDir: 'test-results',

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: {...devices['Desktop Chrome']},
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    //
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
})
