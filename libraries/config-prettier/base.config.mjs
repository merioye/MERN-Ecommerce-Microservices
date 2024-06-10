/*
 * This is a base Prettier configuration for use with
 * internal (bundled by their consumer) libraries
 */

/** @type {import("prettier").Config} */
export default {
  printWidth: 80,
  tabWidth: 2,
  semi: true,
  singleQuote: true,
  jsxSingleQuote: true,
  trailingComma: 'es5',
  bracketSpacing: true,
  endOfLine: 'auto',
  singleAttributePerLine: true,
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderTypeScriptVersion: '5.4.5',
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
};
