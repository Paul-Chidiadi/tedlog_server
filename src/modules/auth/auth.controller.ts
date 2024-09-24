import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Patch,
  Post,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateSuccessResponse } from 'src/common/utils/response.utils';
import { LoginDto } from './dto/login.dto';
import { envConfig } from 'src/common/config/env.config';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() createUserDto: CreateUserDto, @Res() response) {
    const user = await this.authService.signup(createUserDto);
    if (user) {
      return CreateSuccessResponse(response, user, 'Registration Succesfull');
    }
    throw new HttpException(
      'Unable to Create User. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Post('login')
  async login(@Body() body: LoginDto, @Res() res: any) {
    const { user, accessToken, refreshToken } = await this.authService.login(
      body.email,
      body.password,
    );
    if (user) {
      // Set JWT token as a cookie in the response
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: envConfig.COOKIE_EXPIRES_IN,
        sameSite: 'none',
      });
      return CreateSuccessResponse(
        res,
        {
          accessToken,
          user,
        },
        'Login Succesfull',
      );
    }
    throw new HttpException(
      'Unable to Login User. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Post('resendOTP')
  async resendOTP(@Body() body: Partial<CreateUserDto>, @Res() response) {
    const updatedResult = await this.authService.resendOTP(body.email);
    if (updatedResult) {
      return CreateSuccessResponse(
        response,
        updatedResult,
        'OTP Sent Succesfully',
      );
    }
    throw new HttpException(
      'Unable to Resend OTP. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Post('forgotPassword')
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Res() response,
  ) {
    const updatedResult = await this.authService.forgotPassword(
      forgotPasswordDto.email,
    );
    if (updatedResult) {
      return CreateSuccessResponse(
        response,
        updatedResult,
        'OTP Sent Succesfully',
      );
    }
    throw new HttpException(
      'Unable to perform forgot Password. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Patch('resetPassword')
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Res() response,
  ) {
    const updatedResult =
      await this.authService.resetPassword(resetPasswordDto);
    if (updatedResult) {
      return CreateSuccessResponse(
        response,
        updatedResult,
        'Reset Password Successfull',
      );
    }
    throw new HttpException(
      'Unable to Reset Password. Please try again later!',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  @Get('refresh')
  async refresh(
    @Headers('Cookie') cookie: string,
    @Res({ passthrough: true }) response: any,
  ) {
    const cookies = cookie.split(';').reduce((acc, curr) => {
      const [key, value] = curr.trim().split('=');
      acc[key] = value;
      return acc;
    }, {});

    const refreshToken = cookies['refreshToken'];

    if (refreshToken) {
      const { user, newAccessToken, newRefreshToken } =
        await this.authService.decodeRefreshToken(refreshToken);

      response.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: true,
        maxAge: envConfig.COOKIE_EXPIRES_IN,
        sameSite: 'none',
      });

      return { accessToken: newAccessToken, user };
    }
    throw new HttpException(
      'Unable to refresh token. Please try again later.',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
