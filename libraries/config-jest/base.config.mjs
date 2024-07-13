/*
 * This is a base Jest configuration for use with
 * internal (bundled by their consumer) libraries
 */

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  // A preset that is used as a base for Jest's configuration
  preset: 'ts-jest',
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: ['/node_modules/'],
  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',
  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: ['json', 'text', 'lcov', 'clover'],
  // An array of file extensions your modules use
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  verbose: true,
};
