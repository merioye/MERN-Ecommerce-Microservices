import { Test, TestingModule } from '@nestjs/testing';
import { CommonAppModule } from '@/modules/common';
import { LoggerModule, LoggerToken } from '@/modules/common/logger';

import { LoggerModuleOptions, TranslatorModuleOptions } from '@/types';
import { Environment } from '@/enums';
import { TranslationKeySeparator } from '@/constants';

import { TranslatorModule, TranslatorServiceToken } from '../translator';

/**
 * LoggerModule options
 */
const loggerModuleOptions: LoggerModuleOptions = {
  environment: Environment.TEST,
  logsDirPath: '/test/logs',
  debugMode: false,
  appName: 'test-service',
};

/**
 * TranslatorModule options
 */
const translatorModuleOptions: TranslatorModuleOptions = {
  fallbackLanguage: 'en',
  translationsDirPath: '/test/translations',
  translationsFileName: 'translations.json',
  langExtractionKey: 'localizationKey',
  translationKeySeparator: TranslationKeySeparator,
};

describe('CommonAppModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    const mockTranslatorService = {
      t: jest.fn().mockReturnValue('OK'),
    };

    const mockLogger = {
      info: jest.fn(),
    };

    module = await Test.createTestingModule({
      imports: [
        CommonAppModule.forRoot({
          logger: loggerModuleOptions,
          translator: translatorModuleOptions,
        }),
        CommonAppModule,
      ],
    })
      .overrideProvider(TranslatorServiceToken)
      .useValue(mockTranslatorService)
      .overrideProvider(LoggerToken)
      .useValue(mockLogger)
      .compile();
  });

  afterAll(async () => {
    await module.close();
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should have CommonAppModule components', () => {
    expect(module.get(LoggerModule)).toBeInstanceOf(LoggerModule);
    expect(module.get(TranslatorModule)).toBeInstanceOf(TranslatorModule);
  });
});