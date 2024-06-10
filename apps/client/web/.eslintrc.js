/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: [require.resolve('@repo/config-eslint/next.config.js')],
  parserOptions: {
    project: true,
  },
};
