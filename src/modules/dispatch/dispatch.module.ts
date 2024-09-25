import { Module } from '@nestjs/common';
import { DispatchService } from './dispatch.service';
import { DispatchController } from './dispatch.controller';
import { UsersService } from '../users/users.service';
import { Utilities } from 'src/common/utils/utils.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Voucher } from './entities/voucher.entity';
import { Dispatch } from './entities/dispatch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Dispatch, User, Voucher])],
  controllers: [DispatchController],
  providers: [DispatchService, UsersService, Utilities],
})
export class DispatchModule {}
