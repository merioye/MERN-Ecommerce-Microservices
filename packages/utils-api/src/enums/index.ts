/**
 * Environments in which the application could be running
 */
enum Environment {
  DEV = 'development',
  PROD = 'production',
  TEST = 'test',
}

/**
 * Configuration(Environment variables) keys
 */
enum Config {
  NODE_ENV = 'NODE_ENV',
  DEBUG_MODE = 'DEBUG_MODE',
  LOCALIZATION_KEY = 'LOCALIZATION_KEY',
  LOCALIZATION_FALLBACK_LANGUAGE = 'LOCALIZATION_FALLBACK_LANGUAGE',
}

export { Environment, Config };
