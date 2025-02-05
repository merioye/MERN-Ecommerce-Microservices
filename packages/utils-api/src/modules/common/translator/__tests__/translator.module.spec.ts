import { Test, TestingModule } from '@nestjs/testing';
import { CommonAppModule } from '@/modules/common';
import { LOGGER } from '@/modules/common/logger';
import { I18nModule } from 'nestjs-i18n';

import {
  CacheModuleOptions,
  LoggerModuleOptions,
  TranslatorModuleOptions,
} from '@/types';
import { Environment } from '@/enums';

import { TRANSLATOR_SERVICE } from '../constants';

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
};

/**
 * CacheModule options
 */
const cacheModuleOptions: CacheModuleOptions = {
  url: 'redis://localhost:6379',
};

describe('TranslatorModule', () => {
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
          cache: cacheModuleOptions,
        }),
        CommonAppModule,
      ],
    })
      .overrideProvider(TRANSLATOR_SERVICE)
      .useValue(mockTranslatorService)
      .overrideProvider(LOGGER)
      .useValue(mockLogger)
      .compile();
  });

  afterAll(async () => {
    await module.close();
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should have TranslatorModule components', () => {
    expect(module.get(I18nModule)).toBeInstanceOf(I18nModule);
  });
});
