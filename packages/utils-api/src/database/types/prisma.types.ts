import { AuditField, SoftDeleteField } from '.';
import {
  CursorPaginationDto,
  OffsetPaginationDto,
} from '../../common/pagination';
import { VERSION_COLUMN } from '../constants';

// #################################### Prisma Type Helpers ####################################
type PrismaCreateOmitField =
  | 'id'
  | 'createdAt'
  | 'updatedAt'
  | typeof VERSION_COLUMN
  | AuditField
  | SoftDeleteField;
type PrismaUpdateOmitField = 'id' | 'createdAt' | AuditField;
export type PrismaCreateInput<CreateInput> = Omit<
  CreateInput,
  PrismaCreateOmitField
>;
export type PrismaWhereInput<WhereInput> = Omit<WhereInput, SoftDeleteField>;
export type PrismaUpdateInput<UpdateInput> = Omit<
  UpdateInput,
  PrismaUpdateOmitField
>;

// ###################################### Prisma Query Options ######################################
export type PrismaCommonOptions<Select, Include> = {
  select?: Select;
  include?: Include;
  withDeleted?: boolean;
};

export type PrismaCreateOptions<Select, Include> = Omit<
  PrismaCommonOptions<Select, Include>,
  'withDeleted'
>;

export type PrismaFindOneParams<WhereInput, Select, Include, OrderBy> =
  PrismaCommonOptions<Select, Include> & {
    where: PrismaWhereInput<WhereInput>;
    orderBy?: OrderBy;
  };

export type PrismaFindManyParams<
  WhereInput,
  Select,
  Include,
  OrderBy,
  ScalarField,
> = PrismaCommonOptions<Select, Include> & {
  where?: PrismaWhereInput<WhereInput>;
  take?: number;
  skip?: number;
  distinct?: ScalarField[];
  orderBy?: OrderBy;
};

export type PrismaFindManyComplexParams<
  WhereInput,
  Select,
  Include,
  OrderBy,
  Having,
  ScalarField,
> = PrismaFindOneParams<WhereInput, Select, Include, OrderBy> & {
  take?: number;
  skip?: number;
  distinct?: ScalarField[];
  having?: Having;
  groupBy?: ScalarField[];
};

export type PrismaCountParams<WhereInput, Select, ScalarField> = {
  where?: PrismaWhereInput<WhereInput>;
  select?: Select;
  distinct?: ScalarField[];
  withDeleted?: boolean;
};

export type PrismaUpdateOptions<Select, Include> = Omit<
  PrismaCommonOptions<Select, Include>,
  'withDeleted'
>;

export type PrismaDeleteOptions<Select, Include> = Omit<
  PrismaCommonOptions<Select, Include>,
  'withDeleted'
>;

export type PrismaBulkOperationParam<CreateInput, UpdateInput, WhereInput> = {
  create?: PrismaCreateInput<CreateInput>[];
  update?: {
    where: PrismaWhereInput<WhereInput>;
    data: PrismaUpdateInput<UpdateInput>;
  }[];
  delete?: PrismaWhereInput<WhereInput>[];
};

export type PrismaOffsetPaginationParams<
  WhereInput,
  Select,
  Include,
  OrderBy,
  ScalarField,
> = PrismaCommonOptions<Select, Include> & {
  pagination: OffsetPaginationDto;
  where?: PrismaWhereInput<WhereInput>;
  orderBy?: OrderBy;
  distinct?: ScalarField[];
};

export type PrismaCursorPaginationParams<
  WhereInput,
  Select,
  Include,
  OrderBy,
  ScalarField,
> = PrismaCommonOptions<Select, Include> & {
  pagination: CursorPaginationDto;
  where?: PrismaWhereInput<WhereInput>;
  orderBy?: OrderBy;
  distinct?: ScalarField[];
};
