/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: [require.resolve('@repo/config-eslint/node.config.js')],
  parserOptions: {
    project: true,
  },
};
