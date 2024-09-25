import { Module } from '@nestjs/common';
import { ConsignorService } from './consignor.service';
import { ConsignorController } from './consignor.controller';

@Module({
  controllers: [ConsignorController],
  providers: [ConsignorService],
})
export class ConsignorModule {}
