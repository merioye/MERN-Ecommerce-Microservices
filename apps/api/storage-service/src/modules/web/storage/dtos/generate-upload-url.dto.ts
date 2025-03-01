import { ApiProperty } from '@nestjs/swagger';
import {
  TRANSLATION_KEY_SEPARATOR,
  TrimString,
  ValidateIfPresent,
} from '@ecohatch/utils-api';
import { StorageEntity } from '@ecohatch/utils-shared';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class GenerateUploadUrlDto {
  @ApiProperty({
    description: 'The type of file the user is uploading.',
    example: 'image/jpeg',
    type: String,
    required: true,
  })
  @TrimString()
  @IsString({ message: 'storage.error.File_type_must_be_a_string' })
  @IsNotEmpty({ message: 'storage.error.File_type_is_required' })
  fileType!: string;

  @ApiProperty({
    description: 'The name of the file the user is uploading.',
    example: 'elite.jpg',
    type: String,
    required: true,
  })
  @TrimString()
  @IsString({ message: 'storage.error.File_name_must_be_a_string' })
  @IsNotEmpty({ message: 'storage.error.File_name_is_required' })
  fileName!: string;

  @ApiProperty({
    description: 'The type of entity the file is associated with.',
    example: StorageEntity.PRODUCTS,
    type: String,
    required: true,
  })
  @TrimString()
  @IsEnum(StorageEntity, {
    message: `storage.error.Entity_type_is_not_valid${TRANSLATION_KEY_SEPARATOR}${JSON.stringify({ entityTypes: Object.values(StorageEntity) })}`,
  })
  @IsString({ message: 'storage.error.Entity_type_must_be_a_string' })
  @IsNotEmpty({ message: 'storage.error.Entity_type_is_required' })
  entityType!: StorageEntity;

  @ApiProperty({
    description: 'The ID of the entity the file is associated with.',
    example: '1234567890',
    type: String,
    required: false,
  })
  @ValidateIfPresent()
  @TrimString()
  @IsString({ message: 'storage.error.Entity_id_must_be_a_string' })
  entityId?: string;
}
