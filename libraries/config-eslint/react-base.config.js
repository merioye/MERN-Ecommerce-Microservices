const { resolve } = require('path');

const project = resolve(process.cwd(), 'tsconfig.json');
const cypressProject = resolve(process.cwd(), './cypress/tsconfig.json');

/*
 * This is a base React ESLint configuration for use with
 * internal (bundled by their consumer) libraries
 * that utilize React.
 */

/** @type {import("eslint").Linter.Config} */
module.exports = {
  env: {
    browser: true,
    es2020: true,
    node: true,
    'vitest-globals/env': true,
    'cypress/globals': true,
  },
  globals: {
    React: true,
    JSX: true,
  },
  extends: [
    './base.config.js',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:vitest-globals/recommended',
    'plugin:testing-library/react',
    'plugin:cypress/recommended',
    'plugin:chai-friendly/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'prettier',
    'turbo',
  ],
  parserOptions: {
    project,
    tsconfigRootDir: process.cwd(),
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: [
    'react',
    'react-hooks',
    'jsx-a11y',
    'vitest',
    'testing-library',
    'cypress',
    'prettier',
  ],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'jsx-a11y/tabindex-no-positive': 'off',
    'no-console': 'off',
    'testing-library/prefer-explicit-assert': 'error',
    'testing-library/prefer-presence-queries': 'error',
    'testing-library/prefer-screen-queries': 'error',
    'cypress/no-assigning-return-values': 'error',
    'cypress/no-unnecessary-waiting': 'error',
    'cypress/assertion-before-screenshot': 'warn',
    'cypress/no-force': 'warn',
    'cypress/no-async-tests': 'error',
    'cypress/no-pause': 'error',
  },
  overrides: [
    {
      files: ['cypress/**'],
      parserOptions: {
        project: cypressProject,
      },
    },
  ],
  settings: {
    react: {
      version: 'detect',
    },
    vitest: {
      typecheck: true,
    },
  },
};
