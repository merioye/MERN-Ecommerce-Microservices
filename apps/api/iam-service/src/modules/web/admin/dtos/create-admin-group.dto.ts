import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAdminGroupDto {
  @ApiProperty({
    description: 'The name of the admin group.',
    example: 'Elite',
    type: String,
    required: true,
  })
  @IsNotEmpty({ message: 'common.error.Name_is_required' })
  @IsString({ message: 'common.error.Name_must_be_a_string' })
  name!: string;

  @ApiProperty({
    description: 'The slug of the admin group.',
    example: 'elite',
    type: String,
    required: true,
  })
  @IsNotEmpty({ message: 'common.error.Slug_is_required' })
  @IsString({ message: 'common.error.Slug_must_be_a_string' })
  slug!: string;

  @ApiProperty({
    description: 'The description of the admin group.',
    example: 'This is an elite group.',
    type: String,
    required: false,
    default: '',
  })
  @IsString({ message: 'common.error.Description_must_be_a_string' })
  @IsOptional()
  description?: string = '';
}
