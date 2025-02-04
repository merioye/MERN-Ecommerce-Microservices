import {
  ExecutionContext,
  Inject,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { createClient } from 'redis';

import { CacheModuleOptions } from '@/types';

import { HASH_SERVICE, HashAlgorithm, IHashService } from '../../hash';
import { ILogger, LoggerToken } from '../../logger';
import { CACHE_CONFIG } from '../constants';
import { ICacheService } from '../interfaces';

/**
 * Service handling Redis cache operations
 * @class RedisCacheService
 * @implements {ICacheService, OnModuleInit}
 */
@Injectable()
export class RedisCacheService
  implements ICacheService, OnModuleInit
{
  private readonly _client: ReturnType<typeof createClient>;

  public constructor(
    @Inject(CACHE_CONFIG) cacheConfig: CacheModuleOptions,
    @Inject(HASH_SERVICE) private readonly _hashService: IHashService,
    @Inject(LoggerToken) private readonly _logger: ILogger
  ) {
    this._client = createClient({
      url: cacheConfig.url,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            throw new Error('Cache connection retries exceeded');
          }
          // Reconnect after ms
          return Math.min(retries * 100, 3000);
        },
      },
    });

    // Error handling
    this._client.on('error', (err) =>
      this._logger.error('Cache Client Error', err)
    );
    this._client.on('connect', () =>
      this._logger.info('Cache Client Connected 🚀')
    );
  }

  /**
   * Connect to Redis when module initializes
   * @returns {Promise<void>}
   */
  public async onModuleInit(): Promise<void> {
    await this.connect();
  }

  /**
   * Connects to the cache database
   * @returns {Promise<void>}
   */
  public async connect(): Promise<void> {
    try {
      await this._client.connect();
    } catch (error) {
      this._logger.error('Failed to connect to Cache:', error);
      throw error;
    }
  }

  /**
   * Disconnects from the cache database
   * @returns {Promise<void>}
   */
  public async disconnect(): Promise<void> {
    try {
      await this._client.quit();
    } catch (error) {
      this._logger.error('Failed to disconnect from Cache:', error);
      throw error;
    }
  }

  /**
   * Retrieves cached data by key
   * @template T - Expected return type
   * @param {string} key - Cache key to retrieve
   * @returns {Promise<T | null>} Cached data or null if not found
   */
  public async get<T>(
    key: string
  ): Promise<T | null> {
    const data = await this._client.get(key);
    return data ? JSON.parse(data) as T : null;
  }

  /**
   * Stores data in cache with optional TTL
   * @param {string} key - Cache key to store
   * @param {any} value - Data to cache
   * @param {number} [ttl] - Optional time-to-live in seconds
   * @returns {Promise<void>}
   */
  public async set(key: string, value: any, ttl?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    await this._client.set(key, serialized, { EX: ttl });
  }

  /**
   * Deletes cache entries matching a pattern
   * @param {string} pattern - glob-style pattern
   * @returns {Promise<void>}
   */
  public async deleteByPattern(pattern: string): Promise<void> {
    const keys = await this._client.keys(pattern);
    if (keys.length) {
      await this._client.del(keys);
    }
  }

  /**
   * Clears entire cache database
   * @returns {Promise<void>}
   */
  public async clearAll(): Promise<void> {
    await this._client.flushDb();
  }

  /**
   * Generates a consistent cache key based on request context
   * @param {ExecutionContext} context - NestJS execution context
   * @param {string} [suffix] - Optional key suffix
   * @returns {Promise<string>} Generated cache key in format: cache:Controller:Handler:ParamsHash:QueryHash:LocalizationLang:Suffix
   * @example
   * // Returns 'cache:ProductsController:getProduct:abc123:def456:eng'
   * generateCacheKey(context);
   */
  public async generateCacheKey(context: ExecutionContext, suffix?: string): Promise<string> {
    const request = context.switchToHttp().getRequest();
    const controller = context.getClass().name;
    const handler = context.getHandler().name;
    const paramsHash = await this._hashService.hash(JSON.stringify(request.params), {
      algorithm: HashAlgorithm.MD5,
    });
    const queryHash = await this._hashService.hash(JSON.stringify(request.query), {
      algorithm: HashAlgorithm.MD5,
    });
    const localizationLang = I18nContext.current()?.lang;

    return `cache:${controller}:${handler}:${paramsHash}:${queryHash}:${localizationLang}${suffix ? `:${suffix}` : ''}`;
  }
}
