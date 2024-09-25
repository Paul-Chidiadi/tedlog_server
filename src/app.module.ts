import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './common/config/db/typeORM.config';
import { ConsignorModule } from './modules/consignor/consignor.module';
import { DispatchModule } from './modules/dispatch/dispatch.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    UsersModule,
    AuthModule,
    ConsignorModule,
    DispatchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
