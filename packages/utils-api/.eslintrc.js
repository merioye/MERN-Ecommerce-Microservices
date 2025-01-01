/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: [require.resolve('@ecohatch/config-eslint/node.config.js')],
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  rules: {
    'import/no-unresolved': 'off',
    'jest/no-conditional-expect': 'off',
  },
};
