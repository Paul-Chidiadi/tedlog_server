import { USER_ROLE } from 'src/common/enums/user.enum';
import { User } from '../entities/user.entity';

export interface ILoginResponse {
  readonly accessToken?: string;
  readonly refreshToken?: string;
  readonly user: User;
  readonly newAccessToken?: string;
  readonly newRefreshToken?: string;
}

export interface ICurrentUser {
  sub: string;
  email: string;
  role: string;
  name: string;
  iat: number;
  exp: number;
}

export interface IUser {
  id?: string;
  name?: string;
  password?: string;
  confirmPassword?: string;
  newPassword?: string;
  OTP?: string;
  otpExpiresAt?: string;
  email?: string;
  phoneNumber?: string;
  role?: USER_ROLE;
  createdAt?: string;
  updatedAt?: string;
}
