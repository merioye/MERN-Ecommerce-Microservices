/**
 * Represents a translation key with optional arguments.
 *
 * @typedef TranslationKeyAndArgs
 * @property {string} key - The main translation key.
 * @property {Record<string, string> | undefined} args - Optional key-value pairs for the translation.
 */
export type TranslationKeyAndArgs = {
  key: string;
  args: Record<string, string> | undefined;
};

/**
 * Type representing the TranslatorModuleOptions.
 *
 * @typedef TranslatorModuleOptions
 *
 * @property {string} fallbackLanguage - The default language to use when translations are missing.
 * @property {string} translationsDirPath - The path to the directory containing the translation files.
 * @property {string} translationsFileName - The name of the file that contains the translations.
 * @property {string} langExtractionKey - The key used to extract the language from the incoming request.
 */
export type TranslatorModuleOptions = {
  fallbackLanguage: string;
  translationsDirPath: string;
  translationsFileName: string;
  langExtractionKey: string;
};
