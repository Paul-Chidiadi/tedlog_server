import { Global, Module } from '@nestjs/common';
import { KarthlogService } from './karthlog.service';
import { KarthlogController } from './karthlog.controller';
import { CardsModule } from './cards/cards.module';
import { TransactionsModule } from './transactions/transactions.module';
import { CowrieModule } from './cowrie/cowrie.module';

@Global()
@Module({
  controllers: [KarthlogController],
  providers: [KarthlogService],
  imports: [CardsModule, TransactionsModule, CowrieModule],
})
export class KarthlogModule {}
