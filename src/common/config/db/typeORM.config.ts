import { DataSource, DataSourceOptions } from 'typeorm';
import { dbConfig } from '../env.config';
import { User } from 'src/modules/users/entities/user.entity';
import { Dispatch } from 'src/modules/dispatch/entities/dispatch.entity';
import { Voucher } from 'src/modules/dispatch/entities/voucher.entity';
import { Payment } from 'src/modules/payments/entities/payments.entity';
import { Card, Minted } from 'src/modules/karthlog/cards/entities/cards.entity';
import {
  Cowrie,
  CowrieHistory,
} from 'src/modules/karthlog/cowrie/entities/cowrie.entity';
import { Transaction } from 'src/modules/karthlog/transactions/entities/transactions.entity';

export const dataSourceOptions: DataSourceOptions = {
  // TypeORM PostgreSQL DB Drivers
  type: dbConfig.DB_DRIVER,
  host: dbConfig.DB_HOST,
  port: dbConfig.DB_PORT,
  username: dbConfig.DB_USERNAME,
  password: dbConfig.DB_PASSWORD,
  database: dbConfig.DB_DATABASE,
  entities: [
    User,
    Dispatch,
    Voucher,
    Payment,
    Card,
    Minted,
    Transaction,
    Cowrie,
    CowrieHistory,
  ],
  synchronize: true,
  ssl: dbConfig.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
