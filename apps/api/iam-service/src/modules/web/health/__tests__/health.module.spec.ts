import { Test, TestingModule } from '@nestjs/testing';
import {
  CommonAppModule,
  LOGGER,
  TRANSLATOR_SERVICE,
} from '@ecohatch/utils-api';

import {
  cacheModuleOptions,
  loggerModuleOptions,
  translatorModuleOptions,
} from '@/config';

import { HEALTH_SERVICE } from '../constants';
import { HealthController } from '../health.controller';
import { HealthModule } from '../health.module';
import { HealthService } from '../services';

describe('HealthModule', () => {
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
        HealthModule,
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

  it('should have HealthModule components', () => {
    expect(module.get(HealthController)).toBeInstanceOf(HealthController);
    expect(module.get(HEALTH_SERVICE)).toBeInstanceOf(HealthService);
  });
});
