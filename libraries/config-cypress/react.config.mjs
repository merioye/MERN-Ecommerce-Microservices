/*
 * This is a custom Cypress configuration for use with
 * internal (bundled by their consumer) libraries
 * that utilize React.
 */

/** @type {Cypress.Config} */
export default {
  e2e: {
    retries: {
      runMode: 3,
    },
    viewportHeight: 1080,
    viewportWidth: 1920,
    video: false,
    screenshotOnRunFailure: false,
  },
};
