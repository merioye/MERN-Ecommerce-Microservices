/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IBasePrismaService } from '@/database/interfaces';
import {
  CursorPaginatedResult,
  OffsetPaginatedResult,
} from '@ecohatch/types-shared';
import { SortDirection } from '@ecohatch/utils-shared';
import { Prisma, PrismaClient } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { SOFT_DELETION_COLUMN, VERSION_COLUMN } from '../constants';
import {
  AuditField,
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
  SoftDeletionFilter,
} from '../types';

/**
 * Base prisma service implementation
 * @class BasePrismaService
 * @implements {IBasePrismaService<T>}
 * @template T - Entity type extending BaseEntity
 * @template ModelName - Prisma model name
 * @template CreateInput - Prisma create input type
 * @template UpdateInput - Prisma update input type
 * @template WhereInput - Prisma where input type
 * @template Select - Prisma select type
 * @template Include - Prisma include type
 * @template OrderBy - Prisma order by type
 * @template Having - Prisma having type
 * @template ScalarField - Prisma scalar field type
 */
export abstract class BasePrismaService<
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
> implements
    IBasePrismaService<
      T,
      ModelName,
      CreateInput,
      UpdateInput,
      WhereInput,
      Select,
      Include,
      OrderBy,
      Having,
      ScalarField
    >
{
  /**
   * List of model fields.
   * @private
   */
  private readonly _modelFields: string[] = [];
  /**
   * Audit fields mapping for tracking user account IDs.
   * @private
   */
  private readonly _auditFields: Record<AuditField, AuditField> = {
    createdBy: 'createdBy',
    updatedBy: 'updatedBy',
    deletedBy: 'deletedBy',
  };
  /**
   * Flag indicating if the model has soft deletion support.
   * @private
   */
  private _modelHasSoftDelete = false;

  public constructor(
    private readonly _prismaService: PrismaClient,
    private readonly _modelName: ModelName
  ) {
    this._modelFields = this.getModelFields(_modelName);
  }

  /**
   * A helper method to dynamically fetch model fields
   * @param modelName - Model name to fetch fields for
   * @returns An array of field names
   */
  private getModelFields(modelName: ModelName): string[] {
    const modelMeta = Prisma.dmmf.datamodel.models.find(
      (model) =>
        model.name.toLowerCase() === modelName?.toString()?.toLowerCase()
    );
    if (!modelMeta) {
      throw new Error(`Invalid model name: ${modelName?.toString()}`);
    }

    const fields = modelMeta.fields
      ? modelMeta.fields.map((field) => field.name)
      : [];

    if (fields.includes(SOFT_DELETION_COLUMN)) {
      this._modelHasSoftDelete = true;
    }

    return fields;
  }

  /**
   * Builds an object with the specified audit field and user account ID.
   * @param fieldName - The name of the audit field to include in the object.
   * @param userAccountId - The ID of the user account to set in the object.
   * @returns An object with the specified audit field and user account ID.
   */
  private buildAuditField(
    fieldName: AuditField,
    userAccountId: EntityPrimaryKey | null
  ): object {
    if (!this._modelFields.includes(fieldName) || !userAccountId) {
      return {};
    }
    return {
      [fieldName]: userAccountId,
    };
  }

  /**
   * Builds a soft deletion filter object based on the model's soft deletion status.
   * @param withDeleted - Whether to include soft deleted records in the filter.
   * @returns A soft deletion filter object.
   */
  private buildSoftDeletionFilter(withDeleted?: boolean): SoftDeletionFilter {
    let filter: SoftDeletionFilter = {};
    if (this._modelHasSoftDelete && !withDeleted) {
      filter = {
        [SOFT_DELETION_COLUMN]: false,
      };
    }
    return filter;
  }

  /**
   * Get the model from the Prisma service
   * @description Use this method to access the prisma model inside subclasses of current class
   * @returns The prisma model
   */
  public get model(): PrismaClient[ModelName] {
    return this._prismaService[this._modelName];
  }

  /**
   * Get the prisma model
   * @description Use this method to access the prisma model inside current class
   * @returns The prisma model
   */
  private get _model(): any {
    return this.model;
  }

  /**
   * Parses the ID of an entity from a string to a number.
   * @param id - The ID string to parse.
   * @returns The parsed ID number.
   */
  public parseId(id: EntityPrimaryKey): number {
    return typeof id === 'number' ? id : parseInt(id);
  }

  /**
   * Executes operations within a transaction
   * @param fn - Function to execute within the transaction
   * @returns Result of the function
   */
  public async transaction<R>(
    fn: (
      tx: Parameters<Parameters<PrismaClient['$transaction']>[0]>[0]
    ) => Promise<R>
  ): Promise<R> {
    return this._prismaService.$transaction(async (tx) => {
      return fn(tx);
    });
  }

  /**
   * Creates a new entity
   * @param data - Entity data
   * @param userAccountId - ID of the user's account performing the action
   * @param options - Prisma create options
   * @returns Created entity
   */
  public async create(
    data: PrismaCreateInput<CreateInput>,
    userAccountId: EntityPrimaryKey | null = null,
    options: PrismaCreateOptions<Select, Include> = {}
  ): Promise<T> {
    return this._model.create({
      data: {
        ...data,
        ...this.buildAuditField(this._auditFields.createdBy, userAccountId),
        ...this.buildAuditField(this._auditFields.updatedBy, userAccountId),
      },
      ...options,
    }) as Promise<T>;
  }

  /**
   * Performs a bulk create operation
   * @param data - Array of entity data
   * @param userAccountId - ID of the user's account performing the action
   * @param options - Prisma create options
   * @returns Created entities
   */
  public async createMany(
    data: PrismaCreateInput<CreateInput>[],
    userAccountId: EntityPrimaryKey | null = null,
    options: PrismaCreateOptions<Select, Include> = {}
  ): Promise<T[]> {
    const createData = data.map((item) => ({
      ...item,
      ...this.buildAuditField(this._auditFields.createdBy, userAccountId),
      ...this.buildAuditField(this._auditFields.updatedBy, userAccountId),
    }));

    return this._model.createManyAndReturn({
      data: createData,
      ...options,
    }) as Promise<T[]>;
  }

  /**
   * Finds an entity by ID
   * @param id - Entity ID
   * @param options - Prisma query options
   * @returns Found entity or null
   */
  public async findById(
    id: EntityPrimaryKey,
    options: PrismaCommonOptions<Select, Include> = {}
  ): Promise<T | null> {
    const filter = this.buildSoftDeletionFilter(options?.withDeleted);
    delete options['withDeleted'];

    return this._model.findUnique({
      where: { id, ...filter },
      ...options,
    }) as Promise<T | null>;
  }

  /**
   * Finds first entity matching the criteria
   * @param params - Query parameters
   * @returns Found entity or null
   */
  public async findOne(
    params: PrismaFindOneParams<WhereInput, Select, Include, OrderBy>
  ): Promise<T | null> {
    const filter = this.buildSoftDeletionFilter(params?.withDeleted);
    delete params['withDeleted'];

    return this._model.findFirst({
      ...params,
      where: { ...params.where, ...filter },
    }) as Promise<T | null>;
  }

  /**
   * Finds or creates an entity
   * @param where - Search criteria
   * @param data - Creation data if entity doesn't exist
   * @param userAccountId - ID of the user's account performing the action
   * @param options - Prisma create options
   * @returns Found or created entity
   */
  public async findOrCreate(
    where: PrismaWhereInput<WhereInput>,
    data: PrismaCreateInput<CreateInput>,
    userAccountId: EntityPrimaryKey | null = null,
    options: PrismaCommonOptions<Select, Include> = {}
  ): Promise<T> {
    const filter = this.buildSoftDeletionFilter(options?.withDeleted);
    delete options['withDeleted'];

    const existing = await this.findOne({
      where: { ...where, ...filter },
      ...options,
    });
    if (existing) {
      return existing;
    }
    return this.create(data, userAccountId, options);
  }

  /**
   * Finds multiple entities matching the criteria
   * @param params - Query parameters
   * @returns Found entities
   */
  public async findMany(
    params: PrismaFindManyParams<
      WhereInput,
      Select,
      Include,
      OrderBy,
      ScalarField
    > = {}
  ): Promise<T[]> {
    const filter = this.buildSoftDeletionFilter(params?.withDeleted);
    delete params['withDeleted'];

    return this._model.findMany({
      ...params,
      where: { ...params?.where, ...filter },
    }) as Promise<T[]>;
  }

  /**
   * Counts entities matching the criteria
   * @param params - Count parameters
   * @returns Number of entities
   */
  public async count(
    params: PrismaCountParams<WhereInput, Select, ScalarField> = {}
  ): Promise<number> {
    const filter = this.buildSoftDeletionFilter(params?.withDeleted);
    delete params['withDeleted'];

    return this._model.count({
      ...params,
      where: { ...params?.where, ...filter },
    }) as Promise<number>;
  }

  /**
   * Finds multiple entities with complex where conditions
   * @param params - Query parameters
   * @returns Found entities
   */
  public async findManyComplex(
    params: PrismaFindManyComplexParams<
      WhereInput,
      Select,
      Include,
      OrderBy,
      Having,
      ScalarField
    >
  ): Promise<T[]> {
    const filter = this.buildSoftDeletionFilter(params?.withDeleted);
    delete params['withDeleted'];

    return this._model.findMany({
      ...params,
      where: { ...params.where, ...filter },
    }) as Promise<T[]>;
  }

  /**
   * Updates an entity
   * @param where - Filter criteria
   * @param data - Update data
   * @param userAccountId - ID of the user's account performing the action
   * @param options - Prisma update options
   * @returns Updated entity or null if update failed
   */
  public async update(
    where: PrismaWhereInput<WhereInput>,
    data: PrismaUpdateInput<UpdateInput>,
    userAccountId: EntityPrimaryKey | null = null,
    options: PrismaUpdateOptions<Select, Include> = {}
  ): Promise<T | null> {
    const updateData = {
      ...data,
      ...this.buildAuditField(this._auditFields.updatedBy, userAccountId),
    };

    try {
      return this._model.update({
        where: where,
        data: updateData,
        ...options,
      }) as Promise<T>;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Performs bulk update operation
   * @param where - Filter criteria
   * @param data - Update data
   * @param userAccountId - ID of the user's account performing the action
   * @returns Updated entities
   */
  public async updateMany(
    where: PrismaWhereInput<WhereInput>,
    data: PrismaUpdateInput<UpdateInput>,
    userAccountId: EntityPrimaryKey | null = null
  ): Promise<T[]> {
    const updateData = {
      ...data,
      ...this.buildAuditField(this._auditFields.updatedBy, userAccountId),
    };

    return this._model.updateManyAndReturn({
      where,
      data: updateData,
    }) as Promise<T[]>;
  }

  /**
   * Updates or creates an entity
   * @param where - Search criteria
   * @param data - Update/creation data
   * @param userAccountId - ID of the user's account performing the action
   * @param options - Prisma create options
   * @returns Found or created entity
   */
  public async upsert(
    where: PrismaWhereInput<WhereInput>,
    data: {
      update: PrismaUpdateInput<UpdateInput>;
      create: PrismaCreateInput<CreateInput>;
    },
    userAccountId: EntityPrimaryKey | null = null,
    options: PrismaUpdateOptions<Select, Include> = {}
  ): Promise<T> {
    const { update, create } = data;
    return this._model.upsert({
      where,
      update: {
        ...update,
        ...this.buildAuditField(this._auditFields.updatedBy, userAccountId),
      },
      create: {
        ...create,
        ...this.buildAuditField(this._auditFields.createdBy, userAccountId),
        ...this.buildAuditField(this._auditFields.updatedBy, userAccountId),
      },
      ...options,
    }) as Promise<T>;
  }

  /**
   * Updates an entity with optimistic lock
   * @param id - Entity ID
   * @param data - Update data
   * @param version - Optimistic lock version
   * @param userAccountId - ID of the user's account performing the action
   * @param options - Prisma update options
   * @returns Updated entity or null if update failed
   */
  public async updateWithOptimisticLock(
    id: EntityPrimaryKey,
    data: PrismaUpdateInput<UpdateInput>,
    version: number,
    userAccountId: EntityPrimaryKey | null = null,
    options: PrismaUpdateOptions<Select, Include> = {}
  ): Promise<T | null> {
    return this.transaction(async (tx) => {
      const current = await (tx[this._modelName] as any).findUnique({
        where: { id },
        select: { [VERSION_COLUMN]: true },
      });

      if (!current || current[VERSION_COLUMN] !== version) {
        return null;
      }

      return (tx[this._modelName] as any).update({
        where: { id },
        data: {
          ...data,
          [VERSION_COLUMN]: version + 1,
          ...this.buildAuditField(this._auditFields.updatedBy, userAccountId),
        },
        ...options,
      }) as Promise<T>;
    });
  }

  /**
   * Deletes an entity
   * @param where - Filter criteria
   * @param options - Prisma delete options
   * @returns Deleted entity or null if delete failed
   */
  public async delete(
    where: PrismaWhereInput<WhereInput>,
    options: PrismaDeleteOptions<Select, Include> = {}
  ): Promise<T | null> {
    try {
      return this._model.delete({
        where: where,
        ...options,
      }) as Promise<T>;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Soft deletes an entity
   * @param where - Filter criteria
   * @param userAccountId - ID of the user's account performing the action
   * @param options - Prisma delete options
   * @returns Deleted entity or null if delete failed
   */
  public async softDelete(
    where: PrismaWhereInput<WhereInput>,
    userAccountId: EntityPrimaryKey | null = null,
    options?: PrismaUpdateOptions<Select, Include>
  ): Promise<T | null> {
    if (!this._modelHasSoftDelete)
      throw new Error('Model does not support soft delete');

    try {
      return this._model.update({
        where: where,
        data: {
          isDeleted: true,
          deletedAt: new Date(),
          ...this.buildAuditField(this._auditFields.deletedBy, userAccountId),
        },
        ...options,
      }) as Promise<T>;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Performs bulk soft delete
   * @param where - Filter criteria
   * @param userAccountId - ID of the user's account performing the action
   * @returns Deleted entities
   */
  public async softDeleteMany(
    where: PrismaWhereInput<WhereInput>,
    userAccountId: EntityPrimaryKey | null = null
  ): Promise<T[]> {
    if (!this._modelHasSoftDelete)
      throw new Error('Model does not support soft delete');

    return this._model.updateManyAndReturn({
      where,
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        ...this.buildAuditField(this._auditFields.deletedBy, userAccountId),
      },
    }) as Promise<T[]>;
  }

  /**
   * Restores a soft-deleted entity
   * @param where - Filter criteria
   * @param userAccountId - ID of the user's account performing the action
   * @param options - Prisma restore options
   * @returns Restored entity or null if restore failed
   */
  public async restore(
    where: PrismaWhereInput<WhereInput>,
    userAccountId: EntityPrimaryKey | null = null,
    options?: PrismaUpdateOptions<Select, Include>
  ): Promise<T | null> {
    if (!this._modelHasSoftDelete)
      throw new Error('Model does not support soft delete');

    try {
      return this._model.update({
        where: where,
        data: {
          isDeleted: false,
          deletedAt: null,
          deletedBy: null,
          ...this.buildAuditField(this._auditFields.updatedBy, userAccountId),
        },
        ...options,
      }) as Promise<T>;
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Performs bulk restore
   * @param where - Filter criteria
   * @param userAccountId - ID of the user's account performing the action
   * @returns Restored entities
   */
  public async restoreMany(
    where: PrismaWhereInput<WhereInput>,
    userAccountId: EntityPrimaryKey | null = null
  ): Promise<T[]> {
    if (!this._modelHasSoftDelete)
      throw new Error('Model does not support soft delete');

    return this._model.updateManyAndReturn({
      where,
      data: {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        ...this.buildAuditField(this._auditFields.updatedBy, userAccountId),
      },
    }) as Promise<T[]>;
  }

  /**
   * Execute bulk operations within a transaction
   * @param operations - Bulk operations
   * @param userAccountId - ID of the user's account performing the action
   */
  public async bulkOperations(
    operations: PrismaBulkOperationParam<CreateInput, UpdateInput, WhereInput>,
    userAccountId: EntityPrimaryKey | null = null
  ): Promise<void> {
    await this.transaction(async (tx) => {
      if (operations.create) {
        await (tx[this._modelName] as any).createMany({
          data: operations.create.map((data) => ({
            ...data,
            ...this.buildAuditField(this._auditFields.createdBy, userAccountId),
            ...this.buildAuditField(this._auditFields.updatedBy, userAccountId),
          })),
        });
      }

      if (operations.update) {
        await Promise.all(
          operations.update.map(({ where, data }) =>
            (tx[this._modelName] as any).updateMany({
              where,
              data: {
                ...data,
                ...this.buildAuditField(
                  this._auditFields.updatedBy,
                  userAccountId
                ),
              },
            })
          )
        );
      }

      if (operations.delete) {
        await Promise.all(
          operations.delete.map((where) =>
            (tx[this._modelName] as any).deleteMany({ where })
          )
        );
      }
    });
  }

  /**
   * Paginate entities using offset-based pagination
   * @param params - Pagination and query parameters
   * @returns Paginated response
   */
  public async offsetPaginate(
    params: PrismaOffsetPaginationParams<
      WhereInput,
      Select,
      Include,
      OrderBy,
      ScalarField
    >
  ): Promise<OffsetPaginatedResult<T>> {
    const {
      pagination: { limit, page },
      ...rest
    } = params;

    const skip = (page - 1) * limit;

    const [items, totalItems] = await Promise.all([
      this.findMany({
        skip,
        take: limit,
        ...rest,
      }),
      this.count({
        where: params.where,
        distinct: params.distinct,
        withDeleted: params.withDeleted,
      }),
    ]);
    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      items,
      limit,
      page,
      totalPages,
      totalItems,
    };
  }

  /**
   * Paginate entities using cursor-based pagination
   * @param params - Pagination and query parameters
   * @returns Paginated response
   */
  public async cursorPaginate(
    params: PrismaCursorPaginationParams<
      WhereInput,
      Select,
      Include,
      OrderBy,
      ScalarField
    >
  ): Promise<CursorPaginatedResult<T>> {
    const {
      pagination: { limit, cursor },
      withDeleted,
      ...rest
    } = params;

    const filter = this.buildSoftDeletionFilter(withDeleted);
    const where = { ...params?.where, ...filter };

    // Fetch one extra item to determine if there's a next page
    const take = limit + 1;

    const items = (await this._model.findMany({
      ...rest,
      where,
      take,
      orderBy: rest?.orderBy || { id: SortDirection.ASC },
      ...(cursor ? { cursor: { id: Number(cursor) }, skip: 1 } : {}),
    })) as T[];

    const hasNextPage = items.length > limit;
    const data = hasNextPage ? items.slice(0, -1) : items;
    const lastItem = data[data.length - 1];
    const nextCursor = lastItem?.id?.toString();

    return {
      items: data,
      nextCursor: nextCursor ? nextCursor : null,
      hasNextPage,
    };
  }
}
