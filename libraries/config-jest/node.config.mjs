import baseConfig from './base.config.mjs';

/*
 * This is a custom Jest configuration for use with
 * internal (bundled by their consumer) libraries
 * that utilize Nodejs.
 */

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  ...baseConfig,
  // The test environment that will be used for testing
  testEnvironment: 'node',
};
