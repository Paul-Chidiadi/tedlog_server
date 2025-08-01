import { Global, Module } from '@nestjs/common';
import { CowrieService } from './cowrie.service';
import { CowrieController } from './cowrie.controller';
import { Cowrie, CowrieHistory } from './entities/cowrie.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Cowrie, CowrieHistory])],
  controllers: [CowrieController],
  providers: [CowrieService],
  exports: [CowrieService],
})
export class CowrieModule {}
