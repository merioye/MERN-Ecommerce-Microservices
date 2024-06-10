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
    '^@/common$',
    '^common$',
    '^@/core$',
    '^core$',
    '^@/modules$',
    '^modules$',
    '^@/entities$',
    '^entities$',
    '^@/entity$',
    '^entity$',
    '^@/models$',
    '^models$',
    '^@/services$',
    '^services$',
    '^@/guards$',
    '^guards$',
    '^@/controllers$',
    '^controllers$',
    '^types$',
    '^@/types$',
    '^@/interfaces$',
    '^interfaces$',
    '^@/config$',
    '^config$',
    '^@/lib$',
    '^lib$',
    '^@/utils$',
    '^utils$',
    '^@/helpers/(.*)$',
    '^helpers$',
    '^@/mocks/(.*)$',
    '^mocks$',
    '^@/__mocks__/(.*)$',
    '^__mocks__$',
    '^@/(locale|locales|translation|translations|i18n)/(.*)$',
    '^(locale|locales|translation|translations|i18n)$',
    '^@/(constants|data|assets)$',
    '^(constants|data|assets)$',
    '^@/styles/(.*)$',
    '^styles$',
    '^[./]',
  ],
};
