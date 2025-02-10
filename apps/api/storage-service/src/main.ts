import { join } from 'path';
import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';
import expressBasicAuth from 'express-basic-auth';
import { WinstonLogger } from '@ecohatch/utils-api';
import { setupGracefulShutdown } from 'nestjs-graceful-shutdown';

import { AppModule } from './app.module';
import { buildSwaggerConfig, loggerModuleOptions } from './config';
import { Config } from './enums';

const logger = WinstonLogger.getInstance(loggerModuleOptions);

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: logger,
  });

  const configService = app.get(ConfigService);
  const PORT = configService.get<number>(Config.PORT);
  const API_DEFAULT_VERSION = configService.get<string>(
    Config.API_DEFAULT_VERSION
  );
  const SWAGGER_USERNAME = configService.get<string>(Config.SWAGGER_USERNAME);
  const SWAGGER_PASSWORD = configService.get<string>(Config.SWAGGER_PASSWORD);

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: API_DEFAULT_VERSION,
  });
  app.useStaticAssets(join(__dirname, '..', 'public'));

  // Add basic auth middleware
  app.use(
    ['/docs', '/docs-json'], // Protect both Swagger UI and Swagger JSON ENDPOINTs
    expressBasicAuth({
      challenge: true,
      users: {
        [SWAGGER_USERNAME!]: SWAGGER_PASSWORD!,
      },
    })
  );

  const document = SwaggerModule.createDocument(app, buildSwaggerConfig(PORT!));
  SwaggerModule.setup('/docs', app, document);

  setupGracefulShutdown({ app });

  await app.listen(PORT!, () => logger.info(`Listening on PORT ${PORT} 🚀`));
}

bootstrap().catch((err: unknown) => {
  logger.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
