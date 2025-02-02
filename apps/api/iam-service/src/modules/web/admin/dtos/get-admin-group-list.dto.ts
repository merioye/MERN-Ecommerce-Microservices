import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  OffsetPaginationDto,
  ParseBoolean,
  TrimString,
  ValidateIfPresent,
} from '@ecohatch/utils-api';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class GetAdminGroupListDto extends OffsetPaginationDto {
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

  @ApiPropertyOptional({
    description: 'Whether the group is active.',
    example: true,
    type: Boolean,
  })
  @ValidateIfPresent()
  @ParseBoolean()
  @IsBoolean({ message: 'common.error.IsActive_must_be_a_boolean' })
  isActive?: boolean;
}
