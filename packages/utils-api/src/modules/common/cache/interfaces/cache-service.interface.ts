import { ExecutionContext } from '@nestjs/common';

export interface ICacheService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  set(key: string, value: any, ttl?: number): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  deleteByPattern(pattern: string): Promise<void>;
  clearAll(): Promise<void>;
  generateCacheKey(context: ExecutionContext, suffix?: string): Promise<string>;
}
