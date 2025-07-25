import {
  IsEmail,
  IsString,
  IsNotEmpty,
  Matches,
  IsOptional,
} from 'class-validator';
import { PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from 'src/common/constants';
import { USER_ROLE } from 'src/common/enums/user.enum';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  // @Matches(PASSWORD_RULE, {
  //   message: PASSWORD_RULE_MESSAGE,
  // })
  password: string;

  @IsString()
  @IsNotEmpty()
  // @Matches(PASSWORD_RULE, {
  //   message: PASSWORD_RULE_MESSAGE,
  // })
  confirmPassword: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  role: USER_ROLE;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  referralId: string;
}
