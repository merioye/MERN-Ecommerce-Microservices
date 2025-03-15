import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class AssignUserPermissionDto {
  @ApiProperty({
    description: 'The user id to assign the permissions',
    example: 1,
    type: Number,
    required: true,
  })
  @IsPositive({ message: 'common.error.User_id_must_be_positive' })
  @IsInt({ message: 'common.error.User_id_must_be_a_number' })
  @IsNotEmpty({ message: 'common.error.User_id_is_required' })
  userId!: number;

  @ApiProperty({
    description: 'The permission ids to assign to the user',
    example: [1, 2, 3],
    type: Number,
    required: true,
    isArray: true,
  })
  @IsArray({
    message: 'common.error.Permission_ids_must_be_an_array',
  })
  @IsPositive({
    each: true,
    message: 'common.error.Permission_ids_must_be_positive',
  })
  @IsInt({
    each: true,
    message: 'common.error.Permission_ids_must_be_a_number',
  })
  @IsNotEmpty({
    each: true,
    message: 'common.error.Permission_ids_is_required',
  })
  permissionIds!: number[];
}

export class AssignUserGroupPermissionDto {
  @ApiProperty({
    description: 'The user group id to assign the permissions',
    example: 1,
    type: Number,
    required: true,
  })
  @IsPositive({ message: 'common.error.User_group_id_must_be_positive' })
  @IsInt({ message: 'common.error.User_group_id_must_be_a_number' })
  @IsNotEmpty({ message: 'common.error.User_group_id_is_required' })
  userGroupId!: number;

  @ApiProperty({
    description: 'The permission ids to assign to the user group',
    example: [1, 2, 3],
    type: Number,
    required: true,
    isArray: true,
  })
  @IsArray({
    message: 'common.error.Permission_ids_must_be_an_array',
  })
  @IsPositive({
    each: true,
    message: 'common.error.Permission_ids_must_be_positive',
  })
  @IsInt({
    each: true,
    message: 'common.error.Permission_ids_must_be_a_number',
  })
  @IsNotEmpty({
    each: true,
    message: 'common.error.Permission_ids_is_required',
  })
  permissionIds!: number[];
}
