import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { EmailService } from 'src/common/utils/email.service';
import { Utilities } from 'src/common/utils/utils.service';
import { JwtService } from '@nestjs/jwt';
import {
  ICurrentUser,
  ILoginResponse,
  IUser,
} from '../users/interfaces/user.interface';
import { User } from '../users/entities/user.entity';
import { envConfig } from 'src/common/config/env.config';
import { UpdateResult } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
    private readonly util: Utilities,
    private jwtService: JwtService,
  ) {}

  async createAccessToken(payload: any): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: Number(envConfig.ACCESSTOKEN_EXPIRES_IN),
    });
  }

  async createRefreshToken(payload: any): Promise<string> {
    return this.jwtService.signAsync(payload, {
      expiresIn: envConfig.REFRESHTOKEN_EXPIRES_IN,
    });
  }

  async decodeRefreshToken(token: string): Promise<ILoginResponse> {
    try {
      const decoded = await this.jwtService.verifyAsync(token, {
        secret: envConfig.JWT_SECRET,
      });

      if (!decoded) {
        throw new HttpException(
          'Invalid refresh token',
          HttpStatus.BAD_REQUEST,
        );
      }
      const expirationTime = decoded.exp as number;
      const currentTime = Math.floor(Date.now() / 1000);
      if (currentTime > expirationTime) {
        // token has expired
        throw new HttpException(
          'Invalid refresh token',
          HttpStatus.BAD_REQUEST,
        );
      }
      const userExist = await this.usersService.findByEmail(decoded.email);
      const payload = {
        sub: decoded.sub,
        email: decoded.email,
        role: decoded.role,
      };
      const newAccessToken = await this.createAccessToken(payload);
      const newRefreshToken = await this.createRefreshToken(payload);
      const result: ILoginResponse = {
        newAccessToken,
        newRefreshToken,
        user: userExist,
      };
      return result as ILoginResponse;
    } catch (error: any) {
      throw new HttpException('Invalid refresh token', HttpStatus.BAD_REQUEST);
    }
  }

  async signup(body: IUser): Promise<Partial<User>> {
    const {
      email,
      password,
      role,
      confirmPassword,
      firstName,
      lastName,
      phoneNumber,
      referralId,
    } = body;
    // check if password matches
    if (password !== confirmPassword) {
      throw new HttpException('Passwords Do not match', HttpStatus.BAD_REQUEST);
    }
    // check if student with email already exists
    const student = await this.usersService.findByEmail(email);
    if (student) {
      throw new HttpException(
        'Email Address already exists',
        HttpStatus.BAD_REQUEST,
      );
    }
    //hash password
    const hashedPassword: string = await this.util.generateHash(password);
    // Generate OTP code
    const { OTP, otpExpiresAt } = await this.util.generateOtpCode();
    const createdUser: Partial<User> = {
      name: `${firstName} ${lastName}`,
      phoneNumber: phoneNumber,
      role: role,
      email,
      passwordDigest: hashedPassword,
      OTP: String(OTP),
      otpExpiresAt: String(otpExpiresAt),
      referralId: String(this.util.generateRandomCode(6, true)),
    };
    // Send email with OTP information
    ////////////////////////////////////////////////////////////////
    const sendMail = await this.emailService.accountActivationMail({
      firstName: createdUser.name,
      email: createdUser.email,
      subject: 'Welcome to your Theddi Account',
      OTP: createdUser.OTP,
    });

    //Save student into database
    if (sendMail.accepted[0] === email) {
      const data = await this.usersService.create(createdUser);
      const filteredData = {
        ...data,
        passwordDigest: null,
        otpExpiresAt: null,
        OTP: null,
      };
      //CHECK IF REFERRALID WAS SENT ALONG BY THIS USER CREATING AN ACCOUNT
      if (referralId) {
        const referralUser =
          await this.usersService.findByReferralId(referralId);
        if (!referralUser) {
          throw new HttpException(
            'Invalid referral ID',
            HttpStatus.BAD_REQUEST,
          );
        }
        const referralCount = referralUser.referrals + 1;
        await this.usersService.updateUser(
          { referrals: referralCount },
          referralUser.email,
        );
        return filteredData;
      }
      return filteredData;
    }
  }

  async login(email: string, password: string): Promise<ILoginResponse> {
    // check if user with email exists
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new HttpException(
        'Invalid Email or Password',
        HttpStatus.BAD_REQUEST,
      );
    }

    // compare hash password against user data
    const hashedPassword = await this.util.comparePassword(
      password,
      user.passwordDigest,
    );
    if (!hashedPassword) {
      throw new HttpException('Incorrect password', HttpStatus.FORBIDDEN);
    }
    const payload = {
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    };
    // Generate a JWT and return it here
    const accessToken = await this.createAccessToken(payload);
    const refreshToken = await this.createRefreshToken(payload);

    return {
      user: { ...user, passwordDigest: null, otpExpiresAt: null, OTP: null },
      refreshToken,
      accessToken,
    };
  }

  async validateOTP(email: string, OTP: string): Promise<Partial<User>> {
    //Get user information
    const user = await this.usersService.findByEmail(email);

    if (user === null) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    // check if otp time has expired
    if (
      user.otpExpiresAt !== undefined &&
      Date.now() > Number(user.otpExpiresAt)
    ) {
      throw new HttpException(
        'Invalid OTP or OTP has expired',
        HttpStatus.BAD_REQUEST,
      );
    }
    // check if OTP is the same as the provided OTP
    if (user.OTP !== OTP) {
      throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST);
    }
    const newUser = {
      ...user,
      passwordDigest: null,
      otpExpiresAt: null,
      OTP: null,
    };
    return newUser;
  }

  async resendOTP(email: string): Promise<UpdateResult> {
    //Get user information
    const user = await this.usersService.findByEmail(email);
    if (user === null) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    // Generate New OTP code
    const { OTP, otpExpiresAt } = await this.util.generateOtpCode();
    //Update user information with new OTP details
    const payload: Partial<User> = {
      OTP: String(OTP),
      otpExpiresAt: String(otpExpiresAt),
    };
    const updatedUser = await this.usersService.updateUser(payload, email);
    const userInfo = {
      firstName: user.name,
      email,
      subject: 'OTP Verification Code',
      OTP,
    };
    // send email notification
    ////////////////////////////////////////////////////////////////
    await this.emailService.sendOTP(userInfo);
    return updatedUser;
  }

  async forgotPassword(email: string): Promise<UpdateResult> {
    //Get user information
    const user = await this.usersService.findByEmail(email);
    if (user === null) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    // Generate New OTP code
    const { OTP, otpExpiresAt } = await this.util.generateOtpCode();
    //Send forgot password email with new OTP code
    ////////////////////////////////////////////////////////////////
    const sendMail = await this.emailService.forgotPasswordMail({
      email: user.email,
      firstName: user.name,
      OTP,
      subject: 'Forgot Password Notification',
    });
    if (sendMail.accepted[0] === email) {
      //Update user information with new OTP details
      const payload: Partial<User> = {
        OTP: String(OTP),
        otpExpiresAt: String(otpExpiresAt),
      };
      const updatedUser = await this.usersService.updateUser(payload, email);
      return updatedUser;
    }
  }

  async resetPassword(body: IUser): Promise<UpdateResult> {
    const { confirmPassword, newPassword, email } = body;
    // check if password match
    if (newPassword !== confirmPassword) {
      throw new HttpException("password doesn't match", HttpStatus.BAD_REQUEST);
    }
    //Get user information
    const user = await this.usersService.findByEmail(email);
    if (user === null) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    //Hash new password
    const hashPassword = await this.util.generateHash(newPassword);
    //Update user information with new password
    const payload: Partial<User> = {
      passwordDigest: hashPassword,
    };
    const updatedUser = await this.usersService.updateUser(payload, email);
    //Send password reset email notification
    ////////////////////////////////////////////////////////////////
    const sendEmail = await this.emailService.resetPasswordMail({
      firstName: user.name,
      email,
      subject: 'Password Reset Notification',
    });
    if (sendEmail.accepted[0] === email) {
      return updatedUser;
    }
  }

  async editProfile(
    currentUser: ICurrentUser,
    body: Partial<IUser>,
  ): Promise<UpdateResult> {
    //Get user information
    const user = await this.usersService.findById(currentUser.sub);
    if (user === null) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    const payload: Partial<IUser> = {
      ...body,
    };
    const updatedUser = await this.usersService.updateUser(payload, user.email);
    return updatedUser;
  }

  async changePassword(
    currentUser: ICurrentUser,
    body: Partial<IUser>,
  ): Promise<UpdateResult> {
    const { newPassword, confirmPassword, OTP } = body;
    // check if password match
    if (newPassword !== confirmPassword) {
      throw new HttpException("password doesn't match", HttpStatus.BAD_REQUEST);
    }
    //Get user information
    const user = await this.usersService.findById(currentUser.sub);
    if (user === null) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    // check if otp time has expired
    if (
      user.otpExpiresAt !== undefined &&
      Date.now() > Number(user.otpExpiresAt)
    ) {
      throw new HttpException(
        'Invalid OTP or OTP has expired',
        HttpStatus.BAD_REQUEST,
      );
    }
    // check if OTP is the same as the provided OTP
    if (user.OTP !== OTP) {
      throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST);
    }
    //Hash new password
    const hashPassword = await this.util.generateHash(newPassword);
    //Update user information with new password
    const payload: Partial<User> = {
      passwordDigest: hashPassword,
    };
    const updatedUser = await this.usersService.updateUser(payload, user.email);
    return updatedUser;
  }

  async changeEmail(
    currentUser: ICurrentUser,
    body: Partial<IUser>,
  ): Promise<UpdateResult> {
    const { email, OTP } = body;
    //Get user information
    const user = await this.usersService.findById(currentUser.sub);
    if (user === null) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    // check if otp time has expired
    if (
      user.otpExpiresAt !== undefined &&
      Date.now() > Number(user.otpExpiresAt)
    ) {
      throw new HttpException(
        'Invalid OTP or OTP has expired',
        HttpStatus.BAD_REQUEST,
      );
    }
    // check if OTP is the same as the provided OTP
    if (user.OTP !== OTP) {
      throw new HttpException('Invalid OTP', HttpStatus.BAD_REQUEST);
    }
    //Update user information with new password
    const payload: Partial<User> = {
      email: email,
    };
    const updatedUser = await this.usersService.updateUser(payload, user.email);
    return updatedUser;
  }
}
