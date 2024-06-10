/*
 * This is a custom ESLint configuration for use with
 * internal (bundled by their consumer) libraries
 * that utilize Nextjs.
 */

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['next/core-web-vitals', './react-base.config.js'],
};
