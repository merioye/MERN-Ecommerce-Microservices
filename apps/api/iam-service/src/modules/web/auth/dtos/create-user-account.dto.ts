import {
  TRANSLATION_KEY_SEPARATOR,
  TrimString,
  ValidateIfPresent,
} from '@ecohatch/utils-api';
import { Role } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
  IsUrl,
} from 'class-validator';

export class CreateUserAccountDto {
  @TrimString()
  @IsString({ message: 'common.error.First_name_must_be_a_string' })
  @IsNotEmpty({ message: 'common.error.First_name_is_required' })
  firstName!: string;

  @TrimString()
  @IsString({ message: 'common.error.Last_name_must_be_a_string' })
  @IsNotEmpty({ message: 'common.error.Last_name_is_required' })
  lastName!: string;

  @TrimString()
  @IsEmail({}, { message: 'common.error.Email_must_be_a_valid_email' })
  @IsString({ message: 'common.error.Email_must_be_a_string' })
  @IsNotEmpty({ message: 'common.error.Email_is_required' })
  email!: string;

  @ValidateIfPresent()
  @TrimString()
  @IsUrl({}, { message: 'common.error.Profile_url_must_be_a_valid_url' })
  @IsString({ message: 'common.error.Profile_url_must_be_a_string' })
  profileUrl?: string;

  @TrimString()
  @IsEnum(Role, {
    message: `userAccount.error.User_type_must_be_one_of_the_following${TRANSLATION_KEY_SEPARATOR}{"roles": ${Object.values(Role).join(', ')}}`,
  })
  @IsString({ message: 'userAccount.error.User_type_must_be_a_string' })
  @IsNotEmpty({ message: 'userAccount.error.User_type_is_required' })
  userType!: Role;

  @IsPositive({
    message: 'userAccount.error.User_reference_id_must_be_a_positive_number',
  })
  @IsInt({ message: 'userAccount.error.User_reference_id_must_be_a_number' })
  userReferenceId!: number;
}
