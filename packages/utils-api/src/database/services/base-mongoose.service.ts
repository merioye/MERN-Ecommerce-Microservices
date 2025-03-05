import {
  CursorPaginatedResult,
  OffsetPaginatedResult,
} from '@ecohatch/types-shared';
import { SortDirection } from '@ecohatch/utils-shared';
import {
  ClientSession,
  Model,
  PipelineStage,
  SchemaType,
  Types,
  UpdateQuery,
} from 'mongoose';

import { SOFT_DELETION_COLUMN, VERSION_COLUMN } from '../constants';
import { IBaseMongooseService } from '../interfaces';
import {
  AggregatePipelineParams,
  AuditField,
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
  MongooseSort,
  MongooseUpdateDocument,
  MongooseUpdateOptions,
  SoftDeletionFilter,
} from '../types';

/**
 * Base mongoose service implementation
 * @class BaseMongooseService
 * @implements {IBaseMongooseService<T>}
 * @template T - Document type extending BaseMongooseDocument & Document (usually a Mongoose Document)
 */
export abstract class BaseMongooseService<T extends BaseMongooseDocument>
  implements IBaseMongooseService<T>
{
  /**
   * Mapping of schema fields to their types.
   * @private
   */
  private readonly _schemaPaths: {
    [key: string]: SchemaType<any, any>;
  };

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
  private readonly _modelHasSoftDelete: boolean = false;

  public constructor(public readonly model: Model<T>) {
    const schema = model.schema;
    this._modelHasSoftDelete =
      // eslint-disable-next-line no-prototype-builtins
      schema.paths.hasOwnProperty(SOFT_DELETION_COLUMN);
    this._schemaPaths = schema.paths;
  }

  /**
   * Builds an audit field object based on the provided field name and user account ID.
   * @param fieldName - Name of the field to be audited.
   * @param userAccountId - ID of the user account performing the action.
   * @returns An object representing the audit field with the provided field name and user account ID.
   */
  private buildAuditField(
    fieldName: keyof typeof this._auditFields,
    userAccountId: MongoosePrimaryKey | null
  ): object {
    if (
      !Object.prototype.hasOwnProperty.call(this._schemaPaths, fieldName) ||
      !userAccountId
    ) {
      return {};
    }
    return { [fieldName]: this.parseObjectId(userAccountId) };
  }

  /**
   * Builds a soft deletion filter based on the model's soft deletion status.
   * @param withDeleted - Whether to include soft deleted documents.
   * @returns A soft deletion filter object.
   */
  private buildSoftDeletionFilter(withDeleted?: boolean): SoftDeletionFilter {
    let filter: SoftDeletionFilter = {};

    if (this._modelHasSoftDelete && !withDeleted) {
      filter = { [SOFT_DELETION_COLUMN]: false };
    }
    return filter;
  }

  /**
   * Parses a Mongoose primary key into a Types.ObjectId.
   * @param id - The Mongoose primary key to be parsed.
   * @returns The parsed Types.ObjectId.
   */
  public parseObjectId(id: MongoosePrimaryKey): Types.ObjectId {
    return typeof id === 'string' ? new Types.ObjectId(id) : id;
  }

  /**
   * Starts a new session for transaction management.
   * @returns A promise that resolves with the started session.
   */
  public async startSession(): Promise<ClientSession> {
    const session = await this.model.db.startSession();
    session.startTransaction();
    return session;
  }

  /**
   * Commits the given session.
   * @param session - The session to commit.
   */
  public async commitSession(session: ClientSession): Promise<void> {
    await session.commitTransaction();
    await session.endSession();
  }

  /**
   * Aborts (rollback) the given session.
   * @param session - The session to abort.
   */
  public async rollbackSession(session: ClientSession): Promise<void> {
    await session.abortTransaction();
    await session.endSession();
  }

  /**
   * Creates a new document
   * @param data - Document data (excluding document builtin and audit fields)
   * @param userAccountId - (Optional) ID of the user's account performing the action
   * @param options - (Optional) Create document options.
   * @returns The created document
   */
  public async create(
    data: MongooseCreateDocument<T>,
    userAccountId: MongoosePrimaryKey | null = null,
    options: {
      session?: ClientSession;
    } = {}
  ): Promise<T> {
    const { session } = options;

    const document = new this.model({
      ...data,
      ...this.buildAuditField(this._auditFields.createdBy, userAccountId),
      ...this.buildAuditField(this._auditFields.updatedBy, userAccountId),
    });

    return document.save({ session });
  }

  /**
   * Creates multiple documents.
   * @param data - Array of document data.
   * @param userAccountId - (Optional) ID of the user's account performing the action.
   * @param options - (Optional) Create document options.
   * @returns The created documents.
   */
  public async createMany(
    data: MongooseCreateDocument<T>[],
    userAccountId: MongoosePrimaryKey | null = null,
    options: {
      session?: ClientSession;
    } = {}
  ): Promise<T[]> {
    const { session } = options;

    const documents = data.map((item) => ({
      ...item,
      ...this.buildAuditField(this._auditFields.createdBy, userAccountId),
      ...this.buildAuditField(this._auditFields.updatedBy, userAccountId),
    }));

    return this.model.insertMany(documents, {
      session,
    }) as unknown as Promise<T[]>;
  }

  /**
   * Finds a document by its ID.
   * @param id - The document ID.
   * @param options - (Optional) Find document options.
   * @returns The found document or null.
   */
  public async findById(
    id: MongoosePrimaryKey,
    options: MongooseCommonOptions<T> = {}
  ): Promise<T | null> {
    const parsedId = this.parseObjectId(id);
    return this.findOne({
      filter: { _id: parsedId },
      ...options,
    });
  }

  /**
   * Finds the first document matching the criteria.
   * @param params - Query options.
   * @returns The found document or null.
   */
  public async findOne(params: MongooseFindOneParams<T>): Promise<T | null> {
    const {
      filter,
      project,
      populate = [],
      sort,
      session,
      withDeleted,
    } = params;
    const softDeleteFilter = this.buildSoftDeletionFilter(withDeleted);

    return this.model
      .findOne({ ...filter, ...softDeleteFilter }, project)
      .populate(populate)
      .sort(sort)
      .session(session || null)
      .exec();
  }

  /**
   * Finds or creates an document.
   * @param filter - The search criteria.
   * @param data - Creation data if the document does not exist.
   * @param userAccountId - (Optional) ID of the user's account performing the action.
   * @param options - (Optional) Find or create options.
   * @returns The found or created document.
   */
  public async findOrCreate(
    filter: MongooseFilterQuery<T>,
    data: MongooseCreateDocument<T>,
    userAccountId: MongoosePrimaryKey | null = null,
    options: MongooseCommonOptions<T> = {}
  ): Promise<T> {
    const existing = await this.findOne({
      filter,
      ...options,
    });
    if (existing) {
      return existing;
    }

    return this.create(data, userAccountId, {
      session: options.session,
    });
  }

  /**
   * Finds multiple documents matching the criteria.
   * @param params - (Optional) Query options.
   * @returns An array of found documents.
   */
  public async findMany(params: MongooseFindManyParams<T> = {}): Promise<T[]> {
    const {
      filter = {},
      project,
      populate = [],
      skip,
      limit,
      sort,
      session,
      withDeleted,
    } = params;

    const softDeleteFilter = this.buildSoftDeletionFilter(withDeleted);
    let query = this.model
      .find({ ...filter, ...softDeleteFilter }, project)
      .populate(populate);

    if (skip && limit) {
      query = query.skip(skip).limit(limit);
    }

    return query
      .sort(sort)
      .session(session || null)
      .exec();
  }

  /**
   * Counts the number of documents matching the criteria.
   * @param params - (Optional) Query options.
   * @returns The count.
   */
  public async count(params: MongooseCountParams<T> = {}): Promise<number> {
    const { filter = {}, distinct, session, withDeleted } = params;
    const softDeleteFilter = this.buildSoftDeletionFilter(withDeleted);

    if (distinct) {
      const results = await this.model
        .distinct(distinct as string, { ...filter, ...softDeleteFilter })
        .session(session || null)
        .exec();
      return results.length;
    }

    return this.model
      .countDocuments({ ...filter, ...softDeleteFilter })
      .session(session || null)
      .exec();
  }

  /**
   * Updates a document.
   * @param filter - Filter criteria.
   * @param data - Update data (excluding audit fields).
   * @param userAccountId - (Optional) ID of the user's account performing the action.
   * @param options - (Optional) Update options.
   * @returns The updated document (or null if not found).
   */
  public async update(
    filter: MongooseFilterQuery<T>,
    data: MongooseUpdateDocument<T>,
    userAccountId: MongoosePrimaryKey | null = null,
    options: MongooseUpdateOptions<T> = {}
  ): Promise<T | null> {
    const { project, populate = [], session } = options;

    const updateData: MongooseUpdateDocument<T> = {
      ...data,
      ...this.buildAuditField(this._auditFields.updatedBy, userAccountId),
    };

    return this.model
      .findOneAndUpdate(filter, updateData as UpdateQuery<T>, {
        new: true,
        projection: project,
      })
      .populate(populate)
      .session(session || null)
      .exec() as unknown as Promise<T | null>;
  }

  /**
   * Updates multiple documents.
   * @param filter - Filter criteria.
   * @param data - Update data (excluding audit fields).
   * @param userAccountId - (Optional) ID of the user's account performing the action.
   * @param options - (Optional) Update options.
   * @returns The updated documents.
   */
  public async updateMany(
    filter: MongooseFilterQuery<T>,
    data: MongooseUpdateDocument<T>,
    userAccountId: MongoosePrimaryKey | null = null,
    options: MongooseUpdateOptions<T> = {}
  ): Promise<T[]> {
    const { session } = options;

    const updateData: MongooseUpdateDocument<T> = {
      ...data,
      ...this.buildAuditField(this._auditFields.updatedBy, userAccountId),
    };

    await this.model
      .updateMany(filter, updateData as UpdateQuery<T>)
      .session(session || null)
      .exec();

    return this.findMany({ filter, ...options });
  }

  /**
   * Updates or creates a document.
   * @param filter - Filter criteria.
   * @param data - Object containing update and creation data.
   * @param userAccountId - (Optional) ID of the user's account performing the action.
   * @param options - (Optional) Upsert options.
   * @returns The updated or created document.
   */
  public async upsert(
    filter: MongooseFilterQuery<T>,
    data: {
      update: MongooseUpdateDocument<T>;
      create: MongooseCreateDocument<T>;
    },
    userAccountId: MongoosePrimaryKey | null = null,
    options: MongooseUpdateOptions<T> = {}
  ): Promise<T> {
    const { project, populate = [], session } = options;
    const { update, create } = data;

    const upsertData: MongooseUpdateDocument<T> = {
      ...update,
      $setOnInsert: {
        ...create,
        ...this.buildAuditField(this._auditFields.createdBy, userAccountId),
        ...this.buildAuditField(this._auditFields.updatedBy, userAccountId),
      },
      ...this.buildAuditField(this._auditFields.updatedBy, userAccountId),
    };

    return this.model
      .findOneAndUpdate(filter, upsertData as UpdateQuery<T>, {
        new: true,
        upsert: true,
        projection: project,
      })
      .populate(populate)
      .session(session || null)
      .exec();
  }

  /**
   * Updates a document with optimistic locking.
   * @param id - The document ID.
   * @param data - Update data (excluding audit fields).
   * @param version - Optimistic lock version.
   * @param userAccountId - (Optional) ID of the user's account performing the action.
   * @param options - (Optional) Update options.
   * @returns The updated document (or null if not found).
   */
  public async updateWithOptimisticLock(
    id: MongoosePrimaryKey,
    data: MongooseUpdateDocument<T>,
    version: number,
    userAccountId: MongoosePrimaryKey | null = null,
    options: MongooseUpdateOptions<T> = {}
  ): Promise<T | null> {
    const { project, populate = [], session } = options;
    const parsedId = this.parseObjectId(id);

    const updateData: MongooseUpdateDocument<T> = {
      ...data,
      [VERSION_COLUMN]: version + 1,
      ...this.buildAuditField(this._auditFields.updatedBy, userAccountId),
    };

    const updated = await this.model
      .findOneAndUpdate(
        { _id: parsedId, [VERSION_COLUMN]: version },
        updateData as UpdateQuery<T>,
        {
          new: true,
          projection: project,
        }
      )
      .populate(populate)
      .session(session || null)
      .exec();

    if (!updated) {
      return null;
    }

    return updated;
  }

  /**
   * Deletes a document.
   * @param filter - Filter criteria.
   * @param options - (Optional) Delete options.
   * @returns The deleted document (or null if not found).
   */
  public async delete(
    filter: MongooseFilterQuery<T>,
    options: MongooseDeleteOptions<T> = {}
  ): Promise<T | null> {
    const { project, populate = [], session } = options;

    return this.model
      .findOneAndDelete(filter, { projection: project })
      .populate(populate)
      .session(session || null)
      .exec();
  }

  /**
   * Soft deletes a document.
   * @param filter - Filter criteria.
   * @param userAccountId - (Optional) ID of the user's account performing the action.
   * @param options - (Optional) Delete options.
   * @returns The soft-deleted document (or null if not found).
   */
  public async softDelete(
    filter: MongooseFilterQuery<T>,
    userAccountId: MongoosePrimaryKey | null = null,
    options: MongooseDeleteOptions<T> = {}
  ): Promise<T | null> {
    const { project, populate = [], session } = options;

    if (!this._modelHasSoftDelete) {
      throw new Error('Model does not support soft delete');
    }

    return this.model
      .findOneAndUpdate(
        filter,
        {
          [SOFT_DELETION_COLUMN]: true,
          deletedAt: new Date(),
          ...this.buildAuditField(this._auditFields.deletedBy, userAccountId),
          ...this.buildAuditField(this._auditFields.updatedBy, userAccountId),
        },
        { new: true, projection: project }
      )
      .populate(populate)
      .session(session || null)
      .exec();
  }

  /**
   * Soft deletes multiple documents.
   * @param filter - Filter criteria.
   * @param userAccountId - (Optional) ID of the user's account performing the action.
   * @param options - (Optional) Delete options.
   * @returns The soft-deleted documents.
   */
  public async softDeleteMany(
    filter: MongooseFilterQuery<T>,
    userAccountId: MongoosePrimaryKey | null = null,
    options: MongooseDeleteOptions<T> = {}
  ): Promise<T[]> {
    const { session } = options;

    if (!this._modelHasSoftDelete) {
      throw new Error('Model does not support soft delete');
    }

    await this.model
      .updateMany(filter, {
        [SOFT_DELETION_COLUMN]: true,
        deletedAt: new Date(),
        ...this.buildAuditField(this._auditFields.deletedBy, userAccountId),
        ...this.buildAuditField(this._auditFields.updatedBy, userAccountId),
      })
      .session(session || null)
      .exec();

    return this.findMany({
      filter,
      withDeleted: true,
      ...options,
    });
  }

  /**
   * Restores a soft-deleted document.
   * @param filter - Filter criteria.
   * @param userAccountId - (Optional) ID of the user's account performing the action.
   * @param options - (Optional) Restore options.
   * @returns The restored document (or null if not found).
   */
  public async restore(
    filter: MongooseFilterQuery<T>,
    userAccountId: MongoosePrimaryKey | null = null,
    options: MongooseRestoreOptions<T> = {}
  ): Promise<T | null> {
    const { project, populate = [], session } = options;

    if (!this._modelHasSoftDelete) {
      throw new Error('Model does not support soft delete');
    }

    return this.model
      .findOneAndUpdate(
        filter,
        {
          [SOFT_DELETION_COLUMN]: false,
          deletedAt: null,
          deletedBy: null,
          ...this.buildAuditField(this._auditFields.updatedBy, userAccountId),
        },
        { new: true, projection: project }
      )
      .populate(populate)
      .session(session || null)
      .exec();
  }

  /**
   * Restores multiple soft-deleted documents.
   * @param filter - Filter criteria.
   * @param userAccountId - (Optional) ID of the user's account performing the action.
   * @param options - (Optional) Restore options.
   * @returns The restored documents.
   */
  public async restoreMany(
    filter: MongooseFilterQuery<T>,
    userAccountId: MongoosePrimaryKey | null = null,
    options: MongooseRestoreOptions<T> = {}
  ): Promise<T[]> {
    const { session } = options;

    if (!this._modelHasSoftDelete) {
      throw new Error('Model does not support soft delete');
    }

    await this.model
      .updateMany(filter, {
        [SOFT_DELETION_COLUMN]: false,
        deletedAt: null,
        deletedBy: null,
        ...this.buildAuditField(this._auditFields.updatedBy, userAccountId),
      })
      .session(session || null)
      .exec();

    return this.findMany({ filter, ...options });
  }

  /**
   * Executes bulk operations (create, update, delete) in one call.
   * @param operations - Bulk operation definitions.
   * @param userAccountId - (Optional) ID of the user's account performing the action.
   * @param options - (Optional) Bulk operation options.
   */
  public async bulkOperations(
    operations: MongooseBulkOperationsParam<T>,
    userAccountId: MongoosePrimaryKey | null = null,
    options: {
      session?: ClientSession;
    } = {}
  ): Promise<void> {
    const session = options.session || (await this.startSession());
    const isExternalSession = !!options.session;

    try {
      if (!isExternalSession) {
        session.startTransaction();
      }

      if (operations.create?.length) {
        const createData = operations.create.map((data) => ({
          ...data,
          ...this.buildAuditField(this._auditFields.createdBy, userAccountId),
          ...this.buildAuditField(this._auditFields.updatedBy, userAccountId),
        }));
        await this.model.insertMany(createData, { session });
      }

      if (operations.update?.length) {
        await Promise.all(
          operations.update.map(({ filter, data }) =>
            this.model
              .updateMany(filter, {
                ...data,
                ...this.buildAuditField(
                  this._auditFields.updatedBy,
                  userAccountId
                ),
              } as UpdateQuery<T>)
              .session(session)
              .exec()
          )
        );
      }

      if (operations.delete?.length) {
        await Promise.all(
          operations.delete.map((filter) =>
            this.model.deleteMany(filter).session(session).exec()
          )
        );
      }

      if (!isExternalSession) {
        await session.commitTransaction();
      }
    } catch (error) {
      if (!isExternalSession) {
        await session.abortTransaction();
      }
      throw error;
    } finally {
      if (!isExternalSession) {
        await session.endSession();
      }
    }
  }

  /**
   * Paginates documents using offset-based pagination.
   * @param params - Pagination options.
   * @returns Offset paginated result.
   */
  public async offsetPaginate(
    params: MongooseOffsetPaginationParams<T>
  ): Promise<OffsetPaginatedResult<T>> {
    const {
      pagination: { limit, page },
      filter = {},
      project,
      populate = [],
      sort,
      session,
      withDeleted,
    } = params;

    const skip = (page - 1) * limit;

    const [items, totalItems] = await Promise.all([
      this.findMany({
        filter,
        project,
        populate,
        skip,
        limit,
        sort,
        session,
        withDeleted,
      }),
      this.count({
        filter,
        session,
        withDeleted,
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
   * Paginates documents using cursor-based pagination.
   * @param params - Pagination options.
   * @returns Cursor paginated result.
   */
  public async cursorPaginate(
    params: MongooseCursorPaginationParams<T>
  ): Promise<CursorPaginatedResult<T>> {
    const {
      pagination: { limit, cursor },
      filter = {},
      project,
      populate,
      sort = { _id: SortDirection.ASC },
      session,
      withDeleted,
    } = params;
    if (Object.prototype.hasOwnProperty.call(sort, 'id')) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      sort._id = sort.id;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete sort.id;
    }

    const cursorFilter = cursor
      ? { _id: { $gt: this.parseObjectId(cursor) }, ...filter }
      : filter;

    // Fetch one extra item to determine if there's a next page
    const items = await this.findMany({
      filter: cursorFilter,
      project,
      populate,
      limit: limit + 1,
      sort: sort as MongooseSort<T>,
      session,
      withDeleted,
    });

    const hasNextPage = items.length > limit;
    const data = hasNextPage ? items.slice(0, -1) : items;
    const lastItem = data[data.length - 1];
    const nextCursor = lastItem?._id?.toString();

    return {
      items: data,
      nextCursor: nextCursor ? nextCursor : null,
      hasNextPage,
    };
  }

  /**
   * Execute a type-safe aggregation pipeline with flexible staging options
   * @template Output - The expected output type of the aggregation results
   * @template Input - The input document type (defaults to entity type T)
   * @param params - Aggregation pipeline configuration
   * @returns Promise resolving to array of typed aggregation results
   */
  public async aggregatePipeline<Output = any, Input = T>(
    params: AggregatePipelineParams<Input, Output>
  ): Promise<Output[]> {
    const softDeleteStage: PipelineStage[] =
      this._modelHasSoftDelete && !params.withDeleted
        ? [{ $match: { [SOFT_DELETION_COLUMN]: false } }]
        : [];

    const fullPipeline = [
      ...softDeleteStage,
      ...(params.prePipeline || []),
      ...params.pipeline,
      ...(params.postPipeline || []),
    ];

    return this.model.aggregate<Output>(fullPipeline, params.options).exec();
  }
}
