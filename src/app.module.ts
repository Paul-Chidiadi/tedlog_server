import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './common/config/db/typeORM.config';
import { ConsignorModule } from './modules/consignor/consignor.module';
import { DispatchModule } from './modules/dispatch/dispatch.module';
import { AdminModule } from './modules/admin/admin.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { KarthlogModule } from './modules/karthlog/karthlog.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          limit: 10, // Max 10 requests
          ttl: 60, // Per 60 seconds
        },
      ],
    }),
    UsersModule,
    AuthModule,
    ConsignorModule,
    DispatchModule,
    AdminModule,
    PaymentsModule,
    KarthlogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
