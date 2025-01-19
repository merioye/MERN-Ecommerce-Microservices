import { ApiProperty } from '@nestjs/swagger';
import {
  IsAtLeastOneFieldProvided,
  TrimString,
  ValidateIfPresent,
} from '@ecohatch/utils-api';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

@IsAtLeastOneFieldProvided()
export class UpdateAdminGroupDto {
  @ApiProperty({
    description: 'The name of the admin group.',
    example: 'Elite',
    type: String,
    required: false,
  })
  @ValidateIfPresent()
  @TrimString()
  @IsNotEmpty({ message: 'common.error.Name_is_required' })
  @IsString({ message: 'common.error.Name_must_be_a_string' })
  name?: string;

  @ApiProperty({
    description: 'The slug of the admin group.',
    example: 'elite',
    type: String,
    required: false,
  })
  @ValidateIfPresent()
  @TrimString()
  @IsNotEmpty({ message: 'common.error.Slug_is_required' })
  @IsString({ message: 'common.error.Slug_must_be_a_string' })
  slug?: string;

  @ApiProperty({
    description: 'The description of the admin group.',
    example: 'Elite group',
    type: String,
    required: false,
  })
  @ValidateIfPresent()
  @TrimString()
  @IsString({ message: 'common.error.Description_must_be_a_string' })
  description?: string;

  @ApiProperty({
    description: 'The status of the admin group.',
    example: false,
    type: Boolean,
    required: false,
  })
  @ValidateIfPresent()
  @IsBoolean({ message: 'common.error.Status_must_be_a_boolean' })
  isActive?: boolean;
}
