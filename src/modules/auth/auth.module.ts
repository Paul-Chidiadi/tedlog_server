import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from '../users/users.service';
import { EmailService } from 'src/common/utils/email.service';
import { Utilities } from 'src/common/utils/utils.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { User, Waitlisted } from '../users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envConfig } from 'src/common/config/env.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Waitlisted]),
    JwtModule.register({
      global: true,
      secret: envConfig.JWT_SECRET,
      signOptions: { expiresIn: Number(envConfig.JWT_EXPIRATION) },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, EmailService, Utilities],
})
export class AuthModule {}
