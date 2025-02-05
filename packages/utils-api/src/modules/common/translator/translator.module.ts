import { DynamicModule } from '@nestjs/common';
import {
  AcceptLanguageResolver,
  CookieResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';

import { TranslatorModuleOptions } from '@/types';

import {
  TRANSLATION_KEY_FORMATTER_SERVICE,
  TRANSLATIONS_FILENAME,
  TRANSLATOR_SERVICE,
} from './constants';
import {
  NestI18nTranslatorService,
  TranslationKeyFormatterService,
} from './services';

/**
 * Global NestJS module for translation
 * This module provides the global Translator instance
 * and configures the nestjs-i18n module for the application
 *
 * @module TranslatorModule
 */
export class TranslatorModule {
  /**
   * Configures the TranslatorModule for the application.
   *
   * @static
   * @param options - The options for the TranslatorModule.
   * @returns The DynamicModule for the TranslatorModule.
   */
  public static forRoot({
    fallbackLanguage,
    translationsDirPath,
    translationsFileName,
    langExtractionKey,
  }: TranslatorModuleOptions): DynamicModule {
    return {
      global: true,
      module: TranslatorModule,
      imports: [
        I18nModule.forRoot({
          fallbackLanguage,
          loaderOptions: {
            path: translationsDirPath,
            watch: true,
          },
          resolvers: [
            new QueryResolver([langExtractionKey]),
            new HeaderResolver([langExtractionKey]),
            new CookieResolver([langExtractionKey]),
            AcceptLanguageResolver,
          ],
        }),
      ],
      providers: [
        {
          provide: TRANSLATIONS_FILENAME,
          useValue: translationsFileName,
        },
        {
          provide: TRANSLATION_KEY_FORMATTER_SERVICE,
          useClass: TranslationKeyFormatterService,
        },
        {
          provide: TRANSLATOR_SERVICE,
          useClass: NestI18nTranslatorService,
        },
      ],
      exports: [TRANSLATOR_SERVICE],
    };
  }
}
