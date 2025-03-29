import {
  CursorPaginatedResult,
  OffsetPaginatedResult,
} from '@ecohatch/types-shared';
import { PrismaClient } from '@prisma/client';

import {
  BaseEntity,
  EntityPrimaryKey,
  PrismaBulkOperationParam,
  PrismaCommonOptions,
  PrismaCountParams,
  PrismaCreateInput,
  PrismaCreateOptions,
  PrismaCursorPaginationParams,
  PrismaDeleteOptions,
  PrismaFindManyComplexParams,
  PrismaFindManyParams,
  PrismaFindOneParams,
  PrismaOffsetPaginationParams,
  PrismaUpdateInput,
  PrismaUpdateOptions,
  PrismaWhereInput,
} from '../types';

/**
 * Generic prisma service interface defining common operations
 * @interface IBasePrismaService
 * @template T - Entity type extending BaseEntity
 * @template ModelName - Prisma model name
 * @template CreateInput - Prisma create input type
 * @template UpdateInput - Prisma update input type
 * @template WhereInput - Prisma where input type
 * @template Select - Prisma select type
 * @template Include - Prisma include type
 * @template OrderBy - Prisma order by type
 * @template Having - Prisma having type
 * @template ScalarField - Prisma scalar field
 */
export interface IBasePrismaService<
  T extends BaseEntity,
  ModelName extends keyof PrismaClient,
  CreateInput extends object,
  UpdateInput extends object,
  WhereInput extends object,
  Select extends object,
  Include extends object,
  OrderBy extends object,
  Having extends object,
  ScalarField extends string,
> {
  model: PrismaClient[ModelName];
  parseId(id: EntityPrimaryKey): number;
  transaction<R>(
    fn: (
      tx: Parameters<Parameters<PrismaClient['$transaction']>[0]>[0]
    ) => Promise<R>
  ): Promise<R>;
  create(
    data: PrismaCreateInput<CreateInput>,
    userAccountId?: EntityPrimaryKey,
    options?: PrismaCreateOptions<Select, Include>
  ): Promise<T>;
  createMany(
    data: PrismaCreateInput<CreateInput>[],
    userAccountId?: EntityPrimaryKey,
    options?: PrismaCreateOptions<Select, Include>
  ): Promise<T[]>;
  findById(
    id: EntityPrimaryKey,
    options?: PrismaCommonOptions<Select, Include>
  ): Promise<T | null>;
  findOne(
    params: PrismaFindOneParams<WhereInput, Select, Include, OrderBy>
  ): Promise<T | null>;
  findOrCreate(
    where: PrismaWhereInput<WhereInput>,
    data: PrismaCreateInput<CreateInput>,
    userAccountId?: EntityPrimaryKey,
    options?: PrismaCommonOptions<Select, Include>
  ): Promise<T>;
  findMany(
    params?: PrismaFindManyParams<
      WhereInput,
      Select,
      Include,
      OrderBy,
      ScalarField
    >
  ): Promise<T[]>;
  findManyComplex(
    params: PrismaFindManyComplexParams<
      WhereInput,
      Select,
      Include,
      OrderBy,
      Having,
      ScalarField
    >
  ): Promise<T[]>;
  count(
    params?: PrismaCountParams<WhereInput, Select, ScalarField>
  ): Promise<number>;
  update(
    where: PrismaWhereInput<WhereInput>,
    data: PrismaUpdateInput<UpdateInput>,
    userAccountId?: EntityPrimaryKey,
    options?: PrismaUpdateOptions<Select, Include>
  ): Promise<T | null>;
  updateMany(
    where: PrismaWhereInput<WhereInput>,
    data: PrismaUpdateInput<UpdateInput>,
    userAccountId?: EntityPrimaryKey
  ): Promise<T[]>;
  upsert(
    where: PrismaWhereInput<WhereInput>,
    data: {
      update: PrismaUpdateInput<UpdateInput>;
      create: PrismaCreateInput<CreateInput>;
    },
    userAccountId?: EntityPrimaryKey,
    options?: PrismaUpdateOptions<Select, Include>
  ): Promise<T>;
  updateWithOptimisticLock(
    id: EntityPrimaryKey,
    data: PrismaUpdateInput<UpdateInput>,
    version: number,
    userAccountId?: EntityPrimaryKey,
    options?: PrismaUpdateOptions<Select, Include>
  ): Promise<T | null>;
  delete(
    where: PrismaWhereInput<WhereInput>,
    options?: PrismaDeleteOptions<Select, Include>
  ): Promise<T | null>;
  deleteMany(where: PrismaWhereInput<WhereInput>): Promise<void>;
  softDelete(
    where: PrismaWhereInput<WhereInput>,
    userAccountId?: EntityPrimaryKey,
    options?: PrismaUpdateOptions<Select, Include>
  ): Promise<T | null>;
  softDeleteMany(
    where: PrismaWhereInput<WhereInput>,
    userAccountId?: EntityPrimaryKey
  ): Promise<T[]>;
  restore(
    where: PrismaWhereInput<WhereInput>,
    userAccountId?: EntityPrimaryKey,
    options?: PrismaUpdateOptions<Select, Include>
  ): Promise<T | null>;
  restoreMany(
    where: PrismaWhereInput<WhereInput>,
    userAccountId?: EntityPrimaryKey
  ): Promise<T[]>;
  bulkOperations(
    operations: PrismaBulkOperationParam<CreateInput, UpdateInput, WhereInput>,
    userAccountId?: EntityPrimaryKey
  ): Promise<void>;
  offsetPaginate(
    params: PrismaOffsetPaginationParams<
      WhereInput,
      Select,
      Include,
      OrderBy,
      ScalarField
    >
  ): Promise<OffsetPaginatedResult<T>>;
  cursorPaginate(
    params: PrismaCursorPaginationParams<
      WhereInput,
      Select,
      Include,
      OrderBy,
      ScalarField
    >
  ): Promise<CursorPaginatedResult<T>>;
}
