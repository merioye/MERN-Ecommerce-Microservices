import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { getConnectionToken } from '@nestjs/mongoose';
import {
  AllExceptionsFilter,
  CACHE_SERVICE,
  CommonAppModule,
  ExceptionHandlingStrategyFactory,
  ICacheService,
  ILogger,
  LOGGER,
  TranslateMessageInterceptor,
  validationPipeOptions,
} from '@ecohatch/utils-api';
import helmet from 'helmet';
import { Connection } from 'mongoose';
import { GracefulShutdownModule } from 'nestjs-graceful-shutdown';

import {
  cacheModuleOptions,
  configOptions,
  cronJobModuleOptions,
  loggerModuleOptions,
  translatorModuleOptions,
} from './config';
import { DatabaseModule } from './database';
import { Config } from './enums';
import { WebAppModule } from './modules/web';

/**
 * The application module
 *
 * This module is the entry point of the application. It initializes the imported modules
 * and providers.
 *
 * @module AppModule
 * @implements {NestModule}
 *
 * @method configure(consumer: MiddlewareConsumer): void - Configures the application middlewares
 */
@Module({
  imports: [
    ConfigModule.forRoot(configOptions),
    DatabaseModule,
    GracefulShutdownModule.forRootAsync({
      inject: [ConfigService, LOGGER, getConnectionToken(), CACHE_SERVICE],
      useFactory: (
        configService: ConfigService,
        logger: ILogger,
        connection: Connection,
        cacheService: ICacheService
      ) => ({
        gracefulShutdownTimeout: configService.get<number>(
          Config.GRACEFUL_SHUTDOWN_TIMEOUT
        ),
        async cleanup(): Promise<void> {
          // Add any cleanup logic here
          logger.info('Closing database connection...');
          await connection.close();
          logger.info('Database connection closed.');
          logger.info('Closing Cache connection...');
          await cacheService.disconnect();
          logger.info('Cache connection closed.');
        },
      }),
    }),
    CommonAppModule.forRoot({
      logger: loggerModuleOptions,
      translator: translatorModuleOptions,
      cache: cacheModuleOptions,
      cronJob: cronJobModuleOptions,
    }),
    WebAppModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TranslateMessageInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe(validationPipeOptions),
    },
    ExceptionHandlingStrategyFactory,
  ],
})
export class AppModule implements NestModule {
  /**
   * Configures the application middlewares
   * This method is called by NestJS to apply middlewares to the application.
   *
   * @param consumer - MiddlewareConsumer
   * @returns {void}
   */
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(helmet()).forRoutes('*');
  }
}
