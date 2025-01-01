import { validationPipeOptions } from '../options';

describe('Configuration Options', () => {
  describe('validationPipeOptions', () => {
    it('should have whitelist enabled', () => {
      expect(validationPipeOptions.whitelist).toBe(true);
    });

    it('should have proper error factory', () => {
      const mockErrors = [
        {
          property: 'email',
          constraints: {
            isEmail: 'email must be a valid email',
          },
        },
      ];

      expect(() =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        validationPipeOptions.exceptionFactory?.(mockErrors)
      ).toThrow();
    });
  });
});
