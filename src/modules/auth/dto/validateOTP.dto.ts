import {
  IsEmail,
  IsString,
  IsNotEmpty,
  Matches,
  IsOptional,
} from 'class-validator';
import { PASSWORD_RULE, PASSWORD_RULE_MESSAGE } from 'src/common/constants';
import { USER_ROLE } from 'src/common/enums/user.enum';

export class ValidateOTPDto {
  @IsEmail()
  @IsNotEmpty()
  @IsOptional()
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  OTP: string;
}
