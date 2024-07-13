import { defineConfig } from 'cypress';
import reactConfig from '@repo/config-cypress/react.config.mjs';

/** @type {Cypress.Config} */
export default defineConfig({
  ...reactConfig,
  e2e: {
    ...reactConfig.e2e,
    specPattern: [
      'cypress/e2e/**/*.e2e-spec.[tj]s?(x)',
      'cypress/e2e/**/*.e2e-test.[tj]s?(x)',
    ],
    baseUrl: process.env.VITE_APP_CLIENT_BASE_URL,
  },
});
