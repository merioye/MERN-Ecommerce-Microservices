import { ApiPropertyOptional } from '@nestjs/swagger';
import { PAGINATION, SortDirection } from '@ecohatch/utils-shared';
import { IsBoolean, IsInt, IsPositive, IsString, Max } from 'class-validator';

import {
  ParseBoolean,
  ParseJson,
  ParseNumber,
  ValidateIfPresent,
} from '../../../core/decorators';
import { IsSortByObject } from '../decorators';

export class CursorPaginationDto {
  @ApiPropertyOptional({
    description: 'The cursor to use for pagination.',
    example: 'cursor',
    type: String,
  })
  @ValidateIfPresent()
  @IsString({ message: 'common.error.Cursor_must_be_a_string' })
  cursor?: string;

  @ApiPropertyOptional({
    description: 'The page number of the pagination.',
    example: 5,
    type: Number,
    default: PAGINATION.DEFAULT_PAGINATION_LIMIT,
    minimum: PAGINATION.MIN_PAGINATION_LIMIT,
    maximum: PAGINATION.MAX_PAGINATION_LIMIT,
  })
  @ValidateIfPresent()
  @ParseNumber()
  @Max(PAGINATION.MAX_PAGINATION_LIMIT, {
    message: 'common.error.Limit_must_be_at_most_100',
  })
  @IsPositive({ message: 'common.error.Page_must_be_a_positive_number' })
  @IsInt({ message: 'common.error.Limit_must_be_a_number' })
  limit: number = PAGINATION.DEFAULT_PAGINATION_LIMIT;

  @ApiPropertyOptional({
    description: 'Whether to exclude pagination from the response.',
    example: true,
    type: Boolean,
    default: false,
  })
  @ValidateIfPresent()
  @ParseBoolean()
  @IsBoolean({ message: 'common.error.WithoutPagination_must_be_a_boolean' })
  withoutPagination: boolean = false;

  @ApiPropertyOptional({
    description: 'Sort criteria',
    example: { name: 'asc', createdAt: 'desc' },
    type: 'object',
  })
  @ValidateIfPresent()
  @ParseJson()
  @IsSortByObject()
  sortBy: Record<string, SortDirection> = {
    createdAt: SortDirection.ASC,
  };
}
