import { defineConfig } from 'allure';

export default defineConfig({
  name: 'Playwright Test Report',
  output: './allure-report',
  historyPath: './allure-history/history.jsonl',
  historyLimit: 20,
  plugins: {
    awesomeAll: {
      import: "@allurereport/plugin-awesome",
      options: {
        reportName: "Allure Awesome: all test",
        singleFile: false,
        reportLanguage: "en",
        open: false,
        filter: ({ labels }) => !labels.find(({ name, value }) => name === "language" && value === "typescript"),
        publish: true,
      },
    },
  },
});
