import { defineConfig } from 'cypress';
import env from '@next/env';
import reactConfig from '@repo/config-cypress/react.config.mjs';

const { loadEnvConfig } = env;
const { combinedEnv } = loadEnvConfig(process.cwd());

/** @type {Cypress.Config} */
export default defineConfig({
  ...reactConfig,
  env: combinedEnv,
  e2e: {
    ...reactConfig.e2e,
    specPattern: [
      'cypress/e2e/**/*.e2e-spec.[tj]s?(x)',
      'cypress/e2e/**/*.e2e-test.[tj]s?(x)',
    ],
    baseUrl: process.env.NEXT_PUBLIC_CLIENT_BASE_URL,
  },
});
