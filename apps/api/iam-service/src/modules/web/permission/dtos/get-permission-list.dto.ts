import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  OffsetPaginationDto,
  TrimString,
  ValidateIfPresent,
} from '@ecohatch/utils-api';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetPermissionListDto extends OffsetPaginationDto {
  @ApiPropertyOptional({
    description: 'The search query.',
    example: 'elite',
    type: String,
  })
  @ValidateIfPresent()
  @TrimString()
  @IsString({ message: 'common.error.Search_must_be_a_string' })
  @IsNotEmpty({ message: 'common.error.Search_is_required' })
  search?: string;
}
