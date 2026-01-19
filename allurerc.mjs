import { defineConfig } from 'allure';

export default defineConfig({
  name: 'Playwright Test Report',
  output: './allure-report',
  plugins: {
    awesome: {
      options: {
        singleFile: false,
        reportLanguage: 'en',
      },
    },
  },
});
