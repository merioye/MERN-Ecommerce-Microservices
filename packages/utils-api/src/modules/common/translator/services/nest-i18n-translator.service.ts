import { Inject, Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';

import {
  TRANSLATION_KEY_FORMATTER_SERVICE,
  TRANSLATIONS_FILENAME,
} from '../constants';
import {
  ITranslationKeyFormatterService,
  ITranslatorService,
} from '../interfaces';

/**
 * The nestjs-18n implementation responsible for translating API response messages.
 *
 * @class NestI18nTranslatorService
 * @implements {ITranslatorService}
 */
@Injectable()
export class NestI18nTranslatorService implements ITranslatorService {
  /**
   * @constructor
   * @param _i18n - The nestjs i18n service
   * @param _translationsFileName - The name of the translations file
   * @param _translationKeyFormatterService - The translation key formatter service
   */
  public constructor(
    @Inject(TRANSLATION_KEY_FORMATTER_SERVICE)
    private readonly _translationKeyFormatterService: ITranslationKeyFormatterService,
    private readonly _i18n: I18nService,
    @Inject(TRANSLATIONS_FILENAME)
    private readonly _translationsFileName: string
  ) {}

  /**
   * Translates the given key using the provided language.
   *
   * @param key - The key of the translation to retrieve.
   * @param lang - Optional. The language to use for the translation.
   * @returns The translation of the provided key.
   */
  public t(key: string, lang?: string): string {
    const [fileName] = this._translationsFileName.split('.');
    const result = this._translationKeyFormatterService.format(key);
    let translationKey = result.key;
    if (fileName) {
      translationKey = `${fileName}.${translationKey}`; // add file name to key
    }

    return this._i18n.translate(translationKey, {
      lang: lang ?? I18nContext.current()?.lang,
      args: result.args,
    });
  }
}
