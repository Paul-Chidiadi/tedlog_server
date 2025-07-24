import { Module } from '@nestjs/common';
import { CowrieService } from './cowrie.service';
import { CowrieController } from './cowrie.controller';
import { Cowrie, CowrieHistory } from './entities/cowrie.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Cowrie, CowrieHistory])],
  controllers: [CowrieController],
  providers: [CowrieService],
})
export class CowrieModule {}
