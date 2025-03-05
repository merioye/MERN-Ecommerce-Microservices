import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Environment, ILogger, LOGGER } from '@ecohatch/utils-api';
import { Connection } from 'mongoose';

import { Config } from '@/enums';

import { DatabaseService } from './database.service';

/**
 * The `DatabaseModule` is a global module that provides and exports the `MongooseModule, DatabaseService`.
 * This module is decorated with `@Global`, making it available throughout the application
 * without needing to import it in each module.
 *
 * @module DatabaseModule
 * @global
 * @provider {DatabaseService} Provides the DatabaseService for database interactions.
 * @export {MongooseModule, DatabaseService} Exports the MongooseModule, DatabaseService to be used in other modules.
 */
@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService, LOGGER],
      useFactory: (configService: ConfigService, logger: ILogger) => {
        return {
          uri: configService.get<string>(Config.DATABASE_URL),
          retryAttempts: configService.get<number>(Config.DATABASE_MAX_RETRIES),
          retryDelay: configService.get<number>(Config.DATABASE_RETRY_DELAY),
          autoIndex:
            configService.get<Environment>(Config.NODE_ENV) !==
            Environment.PROD, // Setting to false in production and managing indexes manually
          retryWrites: true, // Automatically retry write operations if they fail
          retryReads: true, // Automatically retry read operations if they fail
          maxPoolSize: 100, // Adjust based on expected concurrent operations
          minPoolSize: 5, // Maintain a minimum pool to reduce connection delays
          socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
          connectTimeoutMS: 10000, // Fail fast if can't connect in 10s
          serverSelectionTimeoutMS: 5000, // Retry connection for 5s if DB is down
          heartbeatFrequencyMS: 30000, // Send heartbeat every 30s to prevent timeouts
          connectionFactory: (connection: Connection): Connection => {
            connection.on('connected', () => {
              logger.info('Successfully connected to database 🚀');
            });
            connection.on('disconnected', () => {
              logger.error('Database connection lost 🔥');
            });
            connection.on('reconnected', () => {
              logger.info('Database connection reestablished 🚀');
            });
            connection.on('error', (error) => {
              logger.error(`Database connection failed 🔥:`, error);
            });

            return connection;
          },
        };
      },
    }),
  ],
  providers: [DatabaseService],
  exports: [MongooseModule, DatabaseService],
})
export class DatabaseModule {}
