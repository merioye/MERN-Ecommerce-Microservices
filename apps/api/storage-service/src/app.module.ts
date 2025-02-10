import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import {
  AllExceptionsFilter,
  CommonAppModule,
  ExceptionHandlingStrategyFactory,
  TranslateMessageInterceptor,
  validationPipeOptions,
} from '@ecohatch/utils-api';
import helmet from 'helmet';
import { GracefulShutdownModule } from 'nestjs-graceful-shutdown';

import {
  cacheModuleOptions,
  configOptions,
  loggerModuleOptions,
  translatorModuleOptions,
} from './config';
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
    GracefulShutdownModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        gracefulShutdownTimeout: configService.get<number>(
          Config.GRACEFUL_SHUTDOWN_TIMEOUT
        ),
        cleanup(): void {
          // Add any cleanup logic here
        },
      }),
    }),
    CommonAppModule.forRoot({
      logger: loggerModuleOptions,
      translator: translatorModuleOptions,
      cache: cacheModuleOptions,
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
