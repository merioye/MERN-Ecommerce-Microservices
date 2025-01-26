/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IBasePrismaService } from '@/database/interfaces';
import { ConflictError } from '@ecohatch/utils-api';
import { Prisma, PrismaClient } from '@prisma/client';

import { PrismaService } from '@/database';

import {
  AuditField,
  BaseEntity,
  SoftDeleteField,
  SoftDeletionFilter,
} from '@/types';

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
 * @template ScalarField - Prisma scalar field type
 */
export abstract class BasePrismaService<
  T extends BaseEntity,
  ModelName extends keyof PrismaClient,
  CreateInput,
  UpdateInput,
  WhereInput,
  Select,
  Include,
  OrderBy,
  ScalarField,
> implements
    IBasePrismaService<
      T,
      CreateInput,
      UpdateInput,
      WhereInput,
      Select,
      Include,
      OrderBy,
      ScalarField
    >
{
  private readonly _modelFields: string[] = [];
  private readonly _auditFields: Record<AuditField, AuditField> = {
    createdBy: 'createdBy',
    updatedBy: 'updatedBy',
    deletedBy: 'deletedBy',
  };
  private _modelHasSoftDelete = false;

  protected constructor(
    private readonly _prismaService: PrismaService,
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

    if (fields.includes('isDeleted')) {
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
    userAccountId: number | null
  ): object {
    if (!this._modelFields.includes(fieldName)) {
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
        isDeleted: false,
      };
    }
    return filter;
  }

  /**
   * Get the model from the Prisma service
   * @description Use this method to access the prisma model inside subclasses of current class
   * @returns The prisma model
   */
  protected get model(): PrismaClient[ModelName] {
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

  async transaction<R>(
    fn: (
      tx: Parameters<Parameters<PrismaClient['$transaction']>[0]>[0]
    ) => Promise<R>
  ): Promise<R> {
    return this._prismaService.$transaction(async (tx) => {
      return fn(tx);
    });
  }

  async create(
    data: Omit<CreateInput, AuditField>,
    userAccountId: number | null = null,
    options: {
      select?: Select;
      include?: Include;
    } = {}
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

  async createMany(
    data: Omit<CreateInput, AuditField>[],
    userAccountId: number | null = null,
    options: {
      select?: Select;
      include?: Include;
    } = {}
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

  async findById(
    id: number,
    options: {
      select?: Select;
      include?: Include;
      withDeleted?: boolean;
    } = {}
  ): Promise<T | null> {
    const filter = this.buildSoftDeletionFilter(options?.withDeleted);
    delete options['withDeleted'];

    return this._model.findUnique({
      where: { id, ...filter },
      ...options,
    }) as Promise<T | null>;
  }

  async findOne(params: {
    where: Omit<WhereInput, SoftDeleteField>;
    select?: Select;
    include?: Include;
    orderBy?: OrderBy;
    withDeleted?: boolean;
  }): Promise<T | null> {
    const filter = this.buildSoftDeletionFilter(params?.withDeleted);
    delete params['withDeleted'];

    return this._model.findFirst({
      ...params,
      where: { ...params.where, ...filter },
    }) as Promise<T | null>;
  }

  async findOrCreate(
    where: Omit<WhereInput, SoftDeleteField>,
    data: Omit<CreateInput, AuditField>,
    userAccountId: number | null = null,
    options: {
      select?: Select;
      include?: Include;
      withDeleted?: boolean;
    } = {}
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

  async findMany(
    params: {
      where?: Omit<WhereInput, SoftDeleteField>;
      select?: Select;
      include?: Include;
      skip?: number;
      take?: number;
      orderBy?: OrderBy;
      distinct?: ScalarField[];
      withDeleted?: boolean;
    } = {}
  ): Promise<T[]> {
    const filter = this.buildSoftDeletionFilter(params?.withDeleted);
    delete params['withDeleted'];

    return this._model.findMany({
      ...params,
      where: { ...params?.where, ...filter },
    }) as Promise<T[]>;
  }

  async count(
    params: {
      where?: Omit<WhereInput, SoftDeleteField>;
      select?: Select;
      distinct?: ScalarField[];
      withDeleted?: boolean;
    } = {}
  ): Promise<number> {
    const filter = this.buildSoftDeletionFilter(params?.withDeleted);
    delete params['withDeleted'];

    return this._model.count({
      ...params,
      where: { ...params?.where, ...filter },
    }) as Promise<number>;
  }

  async findManyComplex(params: {
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
  }): Promise<T[]> {
    const filter = this.buildSoftDeletionFilter(params?.withDeleted);
    delete params['withDeleted'];

    return this._model.findMany({
      ...params,
      where: { ...params.where, ...filter },
    }) as Promise<T[]>;
  }

  async update(
    where: WhereInput,
    data: Omit<UpdateInput, AuditField>,
    userAccountId: number | null = null,
    options: {
      select?: Select;
      include?: Include;
    } = {}
  ): Promise<T> {
    const updateData = {
      ...data,
      ...this.buildAuditField(this._auditFields.updatedBy, userAccountId),
    };

    return this._model.update({
      where: where,
      data: updateData,
      ...options,
    }) as Promise<T>;
  }

  async updateMany(
    where: WhereInput,
    data: Omit<UpdateInput, AuditField>,
    userAccountId: number | null = null
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

  async upsert(
    where: WhereInput,
    data: {
      update: Omit<UpdateInput, AuditField>;
      create: Omit<CreateInput, AuditField>;
    },
    userAccountId: number | null = null,
    options: {
      select?: Select;
      include?: Include;
    } = {}
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

  async updateWithOptimisticLock(
    id: number,
    data: Omit<UpdateInput, AuditField>,
    version: number,
    userAccountId: number | null = null,
    options: {
      select?: Select;
      include?: Include;
    } = {}
  ): Promise<T> {
    return this.transaction(async (tx) => {
      const current = await (tx[this._modelName] as any).findUnique({
        where: { id },
        select: { version: true },
      });

      if (!current || current.version !== version) {
        throw new ConflictError('Concurrent update detected');
      }

      return (tx[this._modelName] as any).update({
        where: { id },
        data: {
          ...data,
          version: version + 1,
          ...this.buildAuditField(this._auditFields.updatedBy, userAccountId),
        },
        ...options,
      }) as Promise<T>;
    });
  }

  async delete(
    where: WhereInput,
    options: { select?: Select; include?: Include } = {}
  ): Promise<T> {
    return this._model.delete({
      where: where,
      ...options,
    }) as Promise<T>;
  }

  async softDelete(
    where: WhereInput,
    userAccountId: number | null = null,
    options?: { select?: Select; include?: Include }
  ): Promise<T> {
    if (!this._modelHasSoftDelete)
      throw new Error('Model does not support soft delete');

    return this._model.update({
      where: where,
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        ...this.buildAuditField(this._auditFields.deletedBy, userAccountId),
      },
      ...options,
    }) as Promise<T>;
  }

  async softDeleteMany(
    where: WhereInput,
    userAccountId: number | null = null
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

  async restore(
    where: WhereInput,
    userAccountId: number | null = null,
    options?: { select?: Select; include?: Include }
  ): Promise<T> {
    if (!this._modelHasSoftDelete)
      throw new Error('Model does not support soft delete');

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
  }

  async restoreMany(
    where: WhereInput,
    userAccountId: number | null = null
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

  async bulkOperations(
    operations: {
      create?: Omit<CreateInput, AuditField>[];
      update?: { where: WhereInput; data: Omit<UpdateInput, AuditField> }[];
      delete?: WhereInput[];
    },
    userAccountId: number | null = null
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
}
