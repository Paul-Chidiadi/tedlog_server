import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Voucher } from '../dispatch/entities/voucher.entity';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Voucher, User])],
  controllers: [AdminController],
  providers: [AdminService, UsersService],
})
export class AdminModule {}
