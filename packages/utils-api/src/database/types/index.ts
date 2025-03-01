import { SOFT_DELETION_COLUMN } from '../constants';

/**
 * Base interface for all entities
 * @interface BaseEntity
 */
export interface BaseEntity {
  id: number;
  isDeleted?: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  createdBy?: number | null;
  updatedBy?: number | null;
  deletedBy?: number | null;
}
export type EntityPrimaryKey = 'number' | 'string';

/**
 * Type for audit fields
 * @typedef AuditField
 */
export type AuditField = 'createdBy' | 'updatedBy' | 'deletedBy';

/**
 * Type for soft delete fields
 * @typedef SoftDeleteField
 */
export type SoftDeleteField = 'isDeleted' | 'deletedAt' | 'deletedBy';

/**
 * Type representing soft deletion filter to pass to fetch data queries
 * @typedef SoftDeletionFilter
 */
export type SoftDeletionFilter = {
  [SOFT_DELETION_COLUMN]?: false;
};

export * from './mongoose.types';
export * from './prisma.types';
