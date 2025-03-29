import { ApiProperty } from '@nestjs/swagger';
import { TrimString } from '@ecohatch/utils-api';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'The email of the user.',
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
    description: 'The password of the user.',
    example: 'password',
    type: String,
    required: true,
  })
  @TrimString()
  @IsString({ message: 'common.error.Password_must_be_a_string' })
  @IsNotEmpty({ message: 'common.error.Password_is_required' })
  password!: string;
}
