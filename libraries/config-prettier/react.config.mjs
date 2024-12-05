import baseConfig from './base.config.mjs';

/*
 * This is a custom Prettier configuration for use with
 * internal (bundled by their consumer) libraries
 * that utilize React
 */

/** @type {import("prettier").Config} */
export default {
  ...baseConfig,
  importOrder: [
    '^react/(.*)$',
    '^next/(.*)$',
    '^react-dom/(.*)$',
    '^react-router-dom/(.*)$',
    '^vitest/(.*)$',
    '^@testing-library/(.*)$',
    '^cypress/(.*)$',
    '<THIRD_PARTY_MODULES>',
    '',
    '^(@/)?hooks$',
    '^(@/)?(store|stores|redux|context|contexts)$',
    '^(@/)?(http|api|actions)$',
    '^(@/)?(routes|router)$',
    '^(@/)?(layouts)$',
    '^(@/)?(pages)$',
    '^(@/)?(app)/(.*)$',
    '^(@/)?(sections)$',
    '^(@/)?(hocs)$',
    '^(@/)?(routes|router)$',
    '^(@/)?(components/ui)/(.*)$',
    '^(@/)?(components)/(.*)$',
    '',
    '^(@/)?lib$',
    '^(@/)?(utils|helpers)$',
    '^(@/)?(theme|themes)$',
    '^(@/)?config$',
    '^(@/)?test-setup$',
    '^(@/)?types$',
    '^(@/)?interfaces$',
    '^(@/)?decorators$',
    '^(@/)?enums$',
    '^(@/)?constants$',
    '^(@/)?templates$',
    '',
    '^(@/)?(locale|locales|translation|translations|i18n)$',
    '^(@/)?(mocks|__mocks__)$',
    '^(@/)?(constants|data|assets)$',
    '^(@/)?(styles)$',
    '',
    '^[./]',
  ],
};
