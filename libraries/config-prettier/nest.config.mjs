import baseConfig from './base.config.mjs';

/*
 * This is a custom Prettier configuration for use with
 * internal (bundled by their consumer) libraries
 * that utilize Nestjs
 */

/** @type {import("prettier").Config} */
export default {
  ...baseConfig,
  importOrder: [
    '^@nestjs/(.*)$',
    '^express',
    '<THIRD_PARTY_MODULES>',
    '',
    '^(@/)?common$',
    '^(@/)?core$',
    '^(@/)?modules$',
    '^(@/)?middlewares$',
    '^(@/)?controllers$',
    '^(@/)?services$',
    '^(@/)?guards$',
    '^(@/)?strategies$',
    '^(@/)?database$',
    '^(@/)?(entities|entity|models)$',
    '^(@/)?repositories$',
    '',
    '^(@/)?lib$',
    '^(@/)?(utils|helpers)$',
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
