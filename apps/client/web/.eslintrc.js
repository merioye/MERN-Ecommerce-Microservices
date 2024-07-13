/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: [require.resolve('@repo/config-eslint/next.config.js')],
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  overrides: [
    {
      files: ['cypress/**/*.{ts,tsx,js,jsx}'],
      parserOptions: {
        project: 'cypress/tsconfig.json',
      },
    },
  ],
  rules: {
    'import/no-unresolved': 'off',
  },
};
