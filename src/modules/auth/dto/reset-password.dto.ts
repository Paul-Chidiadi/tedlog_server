import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  confirmPassword: string;

  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  @IsNotEmpty()
  OTP: string;
}
