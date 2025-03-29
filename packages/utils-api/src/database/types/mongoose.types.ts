import { SortDirection } from '@ecohatch/utils-shared';
import {
  AggregateOptions,
  ClientSession,
  FilterQuery,
  PipelineStage,
  PopulateOptions,
  ProjectionType,
  Types,
  UpdateQuery,
} from 'mongoose';

import { AuditField, SoftDeleteField } from '.';
import {
  CursorPaginationDto,
  OffsetPaginationDto,
} from '../../common/pagination';
import { VERSION_COLUMN } from '../constants';

// #################################### Mongoose Type Helpers ####################################

/**
 * Base type defining common fields for mongoose documents
 * @typedef BaseMongooseDocument
 */
export type BaseMongooseDocument = {
  _id: string;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
};
type MongooseCreateOmitField =
  | '_id'
  | 'createdAt'
  | 'updatedAt'
  | typeof VERSION_COLUMN
  | AuditField
  | SoftDeleteField;
type MongooseUpdateOmitField = '_id' | 'createdAt' | AuditField;
export type MongoosePrimaryKey = Types.ObjectId | string;
export type MongooseFilterQuery<T> = FilterQuery<Omit<T, SoftDeleteField>>;
export type MongooseCreateDocument<T> = Omit<T, MongooseCreateOmitField>;
export type MongooseUpdateDocument<T> = UpdateQuery<
  Omit<T, MongooseUpdateOmitField>
>;
export type MongooseSort<T> = Record<keyof T, SortDirection>;

// ###################################### Mongoose Query Options ######################################

export type MongooseCommonOptions<T> = {
  project?: ProjectionType<T>;
  populate?: PopulateOptions | (PopulateOptions | string)[];
  session?: ClientSession;
  withDeleted?: boolean;
};

export type MongooseFindOneParams<T> = MongooseCommonOptions<T> & {
  filter: MongooseFilterQuery<T>;
  sort?: MongooseSort<T>;
};

export type MongooseFindManyParams<T> = Partial<MongooseFindOneParams<T>> & {
  skip?: number;
  limit?: number;
};

export type MongooseCountParams<T> = {
  filter?: MongooseFilterQuery<T>;
  distinct?: keyof T;
  session?: ClientSession;
  withDeleted?: boolean;
};

export type MongooseUpdateOptions<T> = Omit<
  MongooseCommonOptions<T>,
  'withDeleted'
>;

export type MongooseDeleteOptions<T> = Omit<
  MongooseCommonOptions<T>,
  'withDeleted'
>;

export type MongooseRestoreOptions<T> = Omit<
  MongooseCommonOptions<T>,
  'withDeleted'
>;

export type MongooseBulkOperationsParam<T> = {
  create?: MongooseCreateDocument<T>[];
  update?: {
    filter: MongooseFilterQuery<T>;
    data: MongooseUpdateDocument<T>;
  }[];
  delete?: MongooseFilterQuery<T>[];
};

export type MongooseOffsetPaginationParams<T> = Partial<
  MongooseFindOneParams<T>
> & {
  pagination: OffsetPaginationDto;
};

export type MongooseCursorPaginationParams<T> = Partial<
  MongooseFindOneParams<T>
> & {
  pagination: CursorPaginationDto;
};

export type AggregatePipelineParams<Input, Output> = {
  /**
   * The main aggregation pipeline stages
   */
  pipeline: PipelineStage[];
  /**
   * Additional aggregation options (session, explain, etc)
   */
  options?: AggregateOptions;
  /**
   * Pipeline stages to prepend before main pipeline
   */
  prePipeline?: PipelineStage[];
  /**
   * Pipeline stages to append after main pipeline
   */
  postPipeline?: PipelineStage[];
  /**
   * Type casting configuration
   */
  typing?: {
    /**
     * Input type for type-safe pipeline operations
     */
    inputType?: Input;
    /**
     * Output type for type-safe results
     */
    outputType?: Output;
  };
  /**
   * Whether to include soft-deleted documents
   * @default false
   */
  withDeleted?: boolean;
};
