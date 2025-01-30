import { ApiProperty } from '@nestjs/swagger';
import { TrimString, ValidateIfPresent } from '@ecohatch/utils-api';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAdminGroupDto {
  @ApiProperty({
    description: 'The name of the admin group.',
    example: 'Elite',
    type: String,
    required: true,
  })
  @TrimString()
  @IsString({ message: 'common.error.Name_must_be_a_string' })
  @IsNotEmpty({ message: 'common.error.Name_is_required' })
  name!: string;

  @ApiProperty({
    description: 'The slug of the admin group.',
    example: 'elite',
    type: String,
    required: true,
  })
  @TrimString()
  @IsString({ message: 'common.error.Slug_must_be_a_string' })
  @IsNotEmpty({ message: 'common.error.Slug_is_required' })
  slug!: string;

  @ApiProperty({
    description: 'The description of the admin group.',
    example: 'This is an elite group.',
    type: String,
    required: false,
    default: '',
  })
  @ValidateIfPresent()
  @TrimString()
  @IsString({ message: 'common.error.Description_must_be_a_string' })
  @IsNotEmpty({ message: 'common.error.Description_is_required' })
  description?: string;
}
