import { PrismaClient } from '@prisma/client';

import { AuditField, BaseEntity, SoftDeleteField } from '@/types';

/**
 * Generic prisma service interface defining common operations
 * @interface IBasePrismaService
 * @template T - Entity type extending BaseEntity
 * @template CreateInput - Prisma create input type
 * @template UpdateInput - Prisma update input type
 * @template WhereInput - Prisma where input type
 * @template Select - Prisma select type
 * @template Include - Prisma include type
 * @template OrderBy - Prisma order by type
 * @template ScalarField - Prisma scalar field
 */
export interface IBasePrismaService<
  T extends BaseEntity,
  CreateInput,
  UpdateInput,
  WhereInput,
  Select,
  Include,
  OrderBy,
  ScalarField,
> {
  /**
   * Execute operations within a transaction
   * @param fn - Function to execute within the transaction
   * @returns Result of the function
   */
  transaction<R>(
    fn: (
      tx: Parameters<Parameters<PrismaClient['$transaction']>[0]>[0]
    ) => Promise<R>
  ): Promise<R>;

  /**
   * Create a new entity
   * @param data - Entity data
   * @param userAccountId - ID of the user's account performing the action
   * @param options - Prisma create options
   * @returns Created entity
   */
  create(
    data: Omit<CreateInput, AuditField>,
    userAccountId?: number,
    options?: {
      select?: Select;
      include?: Include;
    }
  ): Promise<T>;

  /**
   * Perform bulk create operation
   * @param data - Array of entity data
   * @param userAccountId - ID of the user's account performing the action
   * @param options - Prisma create options
   * @returns Created entities
   */
  createMany(
    data: Omit<CreateInput, AuditField>[],
    userAccountId?: number,
    options?: {
      select?: Select;
      include?: Include;
    }
  ): Promise<T[]>;

  /**
   * Find entity by ID
   * @param id - Entity ID
   * @param options - Prisma query options
   * @returns Found entity
   */
  findById(
    id: number,
    options?: {
      select?: Select;
      include?: Include;
      withDeleted?: boolean;
    }
  ): Promise<T | null>;

  /**
   * Find first entity matching the criteria
   * @param params - Query parameters
   * @returns Found entity
   */
  findOne(params: {
    where: Omit<WhereInput, SoftDeleteField>;
    select?: Select;
    include?: Include;
    orderBy?: OrderBy;
    withDeleted?: boolean;
  }): Promise<T | null>;

  /**
   * Find or create entity
   * @param where - Search criteria
   * @param data - Creation data if entity doesn't exist
   * @param userAccountId - ID of the user's account performing the action
   * @param options - Prisma create options
   * @returns Found or created entity
   */
  findOrCreate(
    where: Omit<WhereInput, SoftDeleteField>,
    data: Omit<CreateInput, AuditField>,
    userAccountId?: number,
    options?: {
      select?: Select;
      include?: Include;
      withDeleted?: boolean;
    }
  ): Promise<T>;

  /**
   * Find multiple entities matching the criteria
   * @param params - Query parameters
   * @returns Found entities
   */
  findMany(params?: {
    where?: Omit<WhereInput, SoftDeleteField>;
    select?: Select;
    include?: Include;
    skip?: number;
    take?: number;
    orderBy?: OrderBy;
    distinct?: ScalarField[];
    withDeleted?: boolean;
  }): Promise<T[]>;

  /**
   * Find with complex where conditions
   * @param params - Query parameters
   * @returns Found entities
   */
  findManyComplex(params: {
    where: Omit<WhereInput, SoftDeleteField>;
    select?: Select;
    include?: Include;
    skip?: number;
    take?: number;
    orderBy?: OrderBy;
    distinct?: ScalarField[];
    having?: any;
    groupBy?: ScalarField[];
    withDeleted?: boolean;
  }): Promise<T[]>;

  /**
   * Count entities matching the criteria
   * @param params - Count parameters
   * @returns Number of entities
   */
  count(params?: {
    where?: Omit<WhereInput, SoftDeleteField>;
    select?: Select;
    distinct?: ScalarField[];
    withDeleted?: boolean;
  }): Promise<number>;

  /**
   * Update an entity
   * @param where - Filter criteria
   * @param data - Update data
   * @param userAccountId - ID of the user's account performing the action
   * @param options - Prisma update options
   * @returns Updated entity
   */
  update(
    where: WhereInput,
    data: Omit<UpdateInput, AuditField>,
    userAccountId?: number,
    options?: {
      select?: Select;
      include?: Include;
    }
  ): Promise<T>;

  /**
   * Perform bulk update operation
   * @param where - Filter criteria
   * @param data - Update data
   * @param userAccountId - ID of the user's account performing the action
   * @returns Updated entities
   */
  updateMany(
    where: WhereInput,
    data: Omit<UpdateInput, AuditField>,
    userAccountId?: number
  ): Promise<T[]>;

  /**
   * Update or create entity
   * @param where - Search criteria
   * @param data - Update/creation data
   * @param userAccountId - ID of the user's account performing the action
   * @param options - Prisma create options
   * @returns Found or created entity
   */
  upsert(
    where: WhereInput,
    data: {
      update: Omit<UpdateInput, AuditField>;
      create: Omit<CreateInput, AuditField>;
    },
    userAccountId?: number,
    options?: {
      select?: Select;
      include?: Include;
    }
  ): Promise<T>;

  /**
   * Update entity with optimistic lock
   * @param id - Entity ID
   * @param data - Update data
   * @param version - Optimistic lock version
   * @param userAccountId - ID of the user's account performing the action
   * @param options - Prisma update options
   * @returns Updated entity
   */
  updateWithOptimisticLock(
    id: number,
    data: Omit<UpdateInput, AuditField>,
    version: number,
    userAccountId?: number,
    options?: {
      select?: Select;
      include?: Include;
    }
  ): Promise<T>;

  /**
   * Delete an entity
   * @param where - Filter criteria
   * @param options - Prisma delete options
   * @returns Deleted entity
   */
  delete(
    where: WhereInput,
    options?: { select?: Select; include?: Include }
  ): Promise<T>;

  /**
   * Soft delete an entity
   * @param where - Filter criteria
   * @param userAccountId - ID of the user's account performing the action
   * @param options - Prisma delete options
   * @returns Deleted entity
   */
  softDelete(
    where: WhereInput,
    userAccountId?: number,
    options?: { select?: Select; include?: Include }
  ): Promise<T>;

  /**
   * Perform bulk soft delete
   * @param where - Filter criteria
   * @param userAccountId - ID of the user's account performing the action
   * @returns Deleted entities
   */
  softDeleteMany(where: WhereInput, userAccountId?: number): Promise<T[]>;

  /**
   * Restore a soft-deleted entity
   * @param where - Filter criteria
   * @param userAccountId - ID of the user's account performing the action
   * @param options - Prisma restore options
   * @returns Restored entity
   */
  restore(
    where: WhereInput,
    userAccountId?: number,
    options?: { select?: Select; include?: Include }
  ): Promise<T>;

  /**
   * Perform bulk restore
   * @param where - Filter criteria
   * @param userAccountId - ID of the user's account performing the action
   * @returns Restored entities
   */
  restoreMany(where: WhereInput, userAccountId?: number): Promise<T[]>;

  /**
   * Execute bulk operations within a transaction
   * @param operations - Bulk operations
   * @param userAccountId - ID of the user's account performing the action
   */
  bulkOperations(
    operations: {
      create?: Omit<CreateInput, AuditField>[];
      update?: { where: WhereInput; data: Omit<UpdateInput, AuditField> }[];
      delete?: WhereInput[];
    },
    userAccountId?: number
  ): Promise<void>;
}
