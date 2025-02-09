import { ApiProperty } from '@nestjs/swagger';
import { TrimString } from '@ecohatch/utils-api';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class CreateAdminDto {
  @ApiProperty({
    description: 'The first name of the admin user.',
    example: 'John',
    type: String,
    required: true,
  })
  @TrimString()
  @IsString({ message: 'common.error.First_name_must_be_a_string' })
  @IsNotEmpty({ message: 'common.error.First_name_is_required' })
  firstName!: string;

  @ApiProperty({
    description: 'The last name of the admin user.',
    example: 'Doe',
    type: String,
    required: true,
  })
  @TrimString()
  @IsString({ message: 'common.error.Last_name_must_be_a_string' })
  @IsNotEmpty({ message: 'common.error.Last_name_is_required' })
  lastName!: string;

  @ApiProperty({
    description: 'The email of the admin user.',
    example: 'john.doe@example.com',
    type: String,
    required: true,
  })
  @TrimString()
  @IsEmail({}, { message: 'common.error.Email_must_be_a_valid_email' })
  @IsString({ message: 'common.error.Email_must_be_a_string' })
  @IsNotEmpty({ message: 'common.error.Email_is_required' })
  email!: string;

  @ApiProperty({
    description: 'The password of the admin user.',
    example: 'password',
    type: String,
    required: true,
  })
  @TrimString()
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    { message: 'common.error.Password_must_be_strong' }
  )
  @IsNotEmpty({ message: 'common.error.Password_is_required' })
  password!: string;

  @ApiProperty({
    description: 'The ID of the admin group.',
    example: 1,
    type: Number,
    required: true,
  })
  @IsPositive({ message: 'admin.error.Admin_group_id_must_be_positive' })
  @IsInt({ message: 'admin.error.Admin_group_id_must_be_a_number' })
  @IsNotEmpty({ message: 'admin.error.Admin_group_id_is_required' })
  adminGroupId!: number;
}
