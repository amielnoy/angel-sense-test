import { defineConfig } from 'allure';

export default defineConfig({
  name: 'Playwright Test Report',
  output: './allure-report',
  historyPath: './allure-history',
  historyLimit: 20,
  plugins: {
    awesome: {
      options: {
        singleFile: false,
        reportLanguage: 'en',
      },
    },
  },
});
