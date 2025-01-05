import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment, ILogger, LoggerToken } from '@ecohatch/utils-api';
import { PrismaClient } from '@prisma/client';

import { Config } from '@/enums';

/**
 * @class PrismaService
 * @description The Prisma service class for handling database operations using Prisma.
 * @extends {PrismaClient}
 * @implements {OnModuleInit}
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly _maxRetries: number;
  private readonly _retryDelay: number;

  public constructor(
    private readonly _configService: ConfigService,
    @Inject(LoggerToken) private readonly _logger: ILogger
  ) {
    const isDevelopment =
      _configService.get(Config.NODE_ENV) === Environment.DEV;
    super({
      datasources: {
        db: {
          url: _configService.get<string>(Config.DATABASE_URL),
        },
      },
      log: ['error', 'warn'],
      errorFormat: 'minimal',
    });

    this._maxRetries = this._configService.get<number>(
      Config.DATABASE_MAX_RETRIES
    )!;
    this._retryDelay = this._configService.get<number>(
      Config.DATABASE_RETRY_DELAY
    )!;

    // Setup extensions
    this.$extends({
      query: {
        $allModels: {
          async $allOperations({ operation, model, args, query }) {
            const start = Date.now();
            const result = await query(args);

            // Log query timing in development
            if (isDevelopment) {
              const duration = Date.now() - start;
              _logger.info(`Query ${model}.${operation} took ${duration}ms`);
            }

            return result;
          },
        },
      },
    });
  }

  /**
   * Connects to the database on module initialization
   * @returns Promise<void>
   */
  public async onModuleInit(): Promise<void> {
    await this.connectWithRetry();
  }

  /**
   * Checks database connection health
   * @returns boolean indicating if database is healthy
   */
  public async ping(): Promise<boolean> {
    for (let attempt = 1; attempt <= this._maxRetries; attempt++) {
      try {
        await this.$queryRaw`SELECT 1`;
        return true;
      } catch (error) {
        if (attempt === this._maxRetries) {
          this._logger.error(`Database health check failed after max retries`);
          return false;
        }
        const delay = this.getRetryDelay(attempt);
        await this.sleep(delay);
      }
    }
    return false;
  }

  /**
   * Implements exponential backoff retry mechanism
   * @param retryCount Current retry attempt number
   * @returns Delay in milliseconds before next retry
   */
  private getRetryDelay(retryCount: number): number {
    return Math.min(
      this._retryDelay * Math.pow(2, retryCount),
      this._configService.get<number>(Config.DATABASE_MAX_RETRY_DELAY)!
    );
  }

  /**
   * Sleep utility function
   * @param ms Milliseconds to sleep
   */
  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Attempts to connect to the database with retry mechanism
   * @returns Promise<void>
   */
  private async connectWithRetry(attempt: number = 1): Promise<void> {
    try {
      await this.$connect();
      this._logger.info('Successfully connected to database');
    } catch (error) {
      if (attempt >= this._maxRetries) {
        this._logger.error(
          `Failed to connect to database after ${this._maxRetries} attempts`
        );
        throw new Error(
          `Database connection failed: ${error instanceof Error ? error.message : JSON.stringify(error)}`
        );
      }

      const delay = this.getRetryDelay(attempt);
      this._logger.warn(
        `Database connection attempt ${attempt} failed. Retrying in ${delay}ms...`,
        error instanceof Error ? error.message : JSON.stringify(error)
      );

      await this.sleep(delay);
      return this.connectWithRetry(attempt + 1);
    }
  }
}
