import { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import { HealthModule } from '@/modules/web/health';
import { CommonAppModule, TRANSLATOR_SERVICE } from '@ecohatch/utils-api';
import request from 'supertest';

import {
  cacheModuleOptions,
  loggerModuleOptions,
  translatorModuleOptions,
} from '@/config';
import { ENDPOINT } from '@/constants';

describe(`GET ${ENDPOINT.Health.Get.HealthCheck}`, () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    const mockTranslatorService = {
      t: jest.fn().mockReturnValue('OK'),
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
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
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 200 and health status', async () => {
    const a = app.getHttpServer();
    const response = await request(a)
      .get(ENDPOINT.Health.Get.HealthCheck)
      .expect(200);

    expect(response.body).toEqual({
      message: 'health.success.Server_is_up_and_running',
      status: 'OK',
    });
  });
});
