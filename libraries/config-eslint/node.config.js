const { resolve } = require('path');

const project = resolve(process.cwd(), 'tsconfig.json');

/*
 * This is a custom ESLint configuration for use with
 * internal (bundled by their consumer) libraries
 * that utilize Nodejs.
 */

/** @type {import("eslint").Linter.Config} */
module.exports = {
  env: {
    node: true,
    jest: true,
  },
  extends: ['./base.config.js', 'plugin:jest/recommended', 'prettier', 'turbo'],
  plugins: ['jest', 'prettier'],
  parserOptions: {
    project,
    tsconfigRootDir: process.cwd(),
    sourceType: 'module',
  },
  rules: {
    'no-console': 'error',
  },
  settings: {
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
};
