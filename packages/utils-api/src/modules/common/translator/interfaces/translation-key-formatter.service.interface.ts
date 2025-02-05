import { TranslationKeyAndArgs } from '../types';

export interface ITranslationKeyFormatterService {
  format(key: string): TranslationKeyAndArgs;
}
