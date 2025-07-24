import { Module } from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';
import { Card, Minted } from './entities/cards.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Transaction } from '../transactions/entities/transactions.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Card, Minted, User, Transaction])],
  controllers: [CardsController],
  providers: [CardsService],
})
export class CardsModule {}
