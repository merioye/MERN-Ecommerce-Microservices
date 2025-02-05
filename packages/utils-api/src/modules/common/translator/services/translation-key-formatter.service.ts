import { Injectable } from '@nestjs/common';

import { TRANSLATION_KEY_SEPARATOR } from '../constants';
import { ITranslationKeyFormatterService } from '../interfaces';
import { TranslationKeyAndArgs } from '../types';

/**
 * The service responsible for formatting translation keys and optional arguments.
 *
 * @class TranslationKeyFormatterService
 * @implements {ITranslationKeyFormatterService}
 **/
@Injectable()
export class TranslationKeyFormatterService
  implements ITranslationKeyFormatterService
{
  /**
   * Extracts the main translation key and optional arguments from a given string.
   *
   * The input string is expected to have the format 'key_?args={jsonArgs}',
   * where 'key' is the main translation key, and 'args' is a JSON string containing
   * optional key-value pairs for the translation.
   *
   * @param {string} key - The full translation key string.
   * @returns An object containing the translation key and optional translation arguments.
   */
  public format(key: string): TranslationKeyAndArgs {
    const [actualKey, args] = key.split(TRANSLATION_KEY_SEPARATOR);
    return {
      key: actualKey ? actualKey : '',
      args: args ? (JSON.parse(args) as Record<string, string>) : undefined,
    };
  }
}
