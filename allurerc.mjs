import { defineConfig } from 'allure';

export default defineConfig({
  name: 'Playwright Test Report',
  output: './allure-report',
  results: './allure-results',
  history: './allure-history',
  plugins: {
    awesome: {
      options: {
        singleFile: false,
        reportLanguage: 'en',
      },
    },
  },
});
