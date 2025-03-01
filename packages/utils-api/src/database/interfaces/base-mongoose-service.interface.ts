import {
  CursorPaginatedResult,
  OffsetPaginatedResult,
} from '@ecohatch/types-shared';
import { ClientSession, Types } from 'mongoose';

import {
  AggregatePipelineParams,
  BaseMongooseDocument,
  MongooseBulkOperationsParam,
  MongooseCommonOptions,
  MongooseCountParams,
  MongooseCreateDocument,
  MongooseCursorPaginationParams,
  MongooseDeleteOptions,
  MongooseFilterQuery,
  MongooseFindManyParams,
  MongooseFindOneParams,
  MongooseOffsetPaginationParams,
  MongoosePrimaryKey,
  MongooseRestoreOptions,
  MongooseUpdateDocument,
  MongooseUpdateOptions,
} from '../types';

/**
 * Generic mongoose service interface defining common operations
 * @interface IBaseMongooseService
 * @template T - Document type extending BaseMongooseDocument & Document (usually a Mongoose Document)
 */
export interface IBaseMongooseService<T extends BaseMongooseDocument> {
  parseObjectId(id: MongoosePrimaryKey): Types.ObjectId;
  startSession(): Promise<ClientSession>;
  commitSession(session: ClientSession): Promise<void>;
  rollbackSession(session: ClientSession): Promise<void>;
  create(
    data: MongooseCreateDocument<T>,
    userAccountId?: MongoosePrimaryKey,
    options?: {
      session?: ClientSession;
    }
  ): Promise<T>;
  createMany(
    data: MongooseCreateDocument<T>[],
    userAccountId?: MongoosePrimaryKey,
    options?: {
      session?: ClientSession;
    }
  ): Promise<T[]>;
  findById(
    id: MongoosePrimaryKey,
    options?: MongooseCommonOptions<T>
  ): Promise<T | null>;
  findOne(params: MongooseFindOneParams<T>): Promise<T | null>;
  findOrCreate(
    filter: MongooseFilterQuery<T>,
    data: MongooseCreateDocument<T>,
    userAccountId?: MongoosePrimaryKey,
    options?: MongooseCommonOptions<T>
  ): Promise<T>;
  findMany(params?: MongooseFindManyParams<T>): Promise<T[]>;
  count(params?: MongooseCountParams<T>): Promise<number>;
  update(
    filter: MongooseFilterQuery<T>,
    data: MongooseUpdateDocument<T>,
    userAccountId?: MongoosePrimaryKey,
    options?: MongooseUpdateOptions<T>
  ): Promise<T | null>;
  updateMany(
    filter: MongooseFilterQuery<T>,
    data: MongooseUpdateDocument<T>,
    userAccountId?: MongoosePrimaryKey,
    options?: MongooseUpdateOptions<T>
  ): Promise<T[]>;
  upsert(
    filter: MongooseFilterQuery<T>,
    data: {
      update: MongooseUpdateDocument<T>;
      create: MongooseCreateDocument<T>;
    },
    userAccountId?: MongoosePrimaryKey,
    options?: MongooseUpdateOptions<T>
  ): Promise<T>;
  updateWithOptimisticLock(
    id: MongoosePrimaryKey,
    data: MongooseUpdateDocument<T>,
    version: number,
    userAccountId?: MongoosePrimaryKey,
    options?: MongooseUpdateOptions<T>
  ): Promise<T | null>;
  delete(
    filter: MongooseFilterQuery<T>,
    options?: MongooseDeleteOptions<T>
  ): Promise<T | null>;
  softDelete(
    filter: MongooseFilterQuery<T>,
    userAccountId?: MongoosePrimaryKey,
    options?: MongooseDeleteOptions<T>
  ): Promise<T | null>;
  softDeleteMany(
    filter: MongooseFilterQuery<T>,
    userAccountId?: MongoosePrimaryKey,
    options?: MongooseDeleteOptions<T>
  ): Promise<T[]>;
  restore(
    filter: MongooseFilterQuery<T>,
    userAccountId?: MongoosePrimaryKey,
    options?: MongooseRestoreOptions<T>
  ): Promise<T | null>;
  restoreMany(
    filter: MongooseFilterQuery<T>,
    userAccountId?: MongoosePrimaryKey,
    options?: MongooseRestoreOptions<T>
  ): Promise<T[]>;
  bulkOperations(
    operations: MongooseBulkOperationsParam<T>,
    userAccountId?: MongoosePrimaryKey,
    options?: {
      session?: ClientSession;
    }
  ): Promise<void>;
  offsetPaginate(
    params: MongooseOffsetPaginationParams<T>
  ): Promise<OffsetPaginatedResult<T>>;
  cursorPaginate(
    params: MongooseCursorPaginationParams<T>
  ): Promise<CursorPaginatedResult<T>>;
  aggregatePipeline<Output = any, Input = T>(
    params: AggregatePipelineParams<Input, Output>
  ): Promise<Output[]>;
}
