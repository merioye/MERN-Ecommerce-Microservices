import { TRANSLATION_KEY_SEPARATOR } from '../../constants';
import { ITranslationKeyFormatterService } from '../../interfaces';
import { TranslationKeyFormatterService } from '../translation-key-formatter.service';

describe('TranslationKeyFormatterService', () => {
  let service: ITranslationKeyFormatterService;

  beforeEach(() => {
    service = new TranslationKeyFormatterService();
  });

  describe('format', () => {
    it('should return key and undefined args when no separator is present', () => {
      const key = 'test.key';
      const result = service.format(key);

      expect(result).toEqual({
        key: 'test.key',
        args: undefined,
      });
    });

    it('should return empty key and undefined args when empty string is provided', () => {
      const key = '';
      const result = service.format(key);

      expect(result).toEqual({
        key: '',
        args: undefined,
      });
    });

    it('should parse key and args when separator is present', () => {
      const key = `test.key${TRANSLATION_KEY_SEPARATOR}{"name":"John","age":"25"}`;
      const result = service.format(key);

      expect(result).toEqual({
        key: 'test.key',
        args: {
          name: 'John',
          age: '25',
        },
      });
    });

    it('should handle empty args object', () => {
      const key = `test.key${TRANSLATION_KEY_SEPARATOR}{}`;
      const result = service.format(key);

      expect(result).toEqual({
        key: 'test.key',
        args: {},
      });
    });

    it('should throw error when args JSON is invalid', () => {
      const key = `test.key${TRANSLATION_KEY_SEPARATOR}{invalid_json}`;

      expect(() => service.format(key)).toThrow(SyntaxError);
    });

    it('should handle key with multiple separators', () => {
      const key = `test.key${TRANSLATION_KEY_SEPARATOR}{"data":"value"}${TRANSLATION_KEY_SEPARATOR}extra`;
      const result = service.format(key);

      expect(result).toEqual({
        key: 'test.key',
        args: {
          data: 'value',
        },
      });
    });

    it('should handle key with special characters in args', () => {
      const key = `test.key${TRANSLATION_KEY_SEPARATOR}{"special":"!@#$%^&*()"}`;
      const result = service.format(key);

      expect(result).toEqual({
        key: 'test.key',
        args: {
          special: '!@#$%^&*()',
        },
      });
    });

    it('should handle key with nested objects in args', () => {
      const key = `test.key${TRANSLATION_KEY_SEPARATOR}{"user":{"name":"John","age":"25"}}`;
      const result = service.format(key);

      expect(result).toEqual({
        key: 'test.key',
        args: {
          user: {
            name: 'John',
            age: '25',
          },
        },
      });
    });
  });
});
