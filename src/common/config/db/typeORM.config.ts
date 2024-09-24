import { DataSource, DataSourceOptions } from 'typeorm';
import { dbConfig } from '../env.config';
import { User } from 'src/modules/users/entities/user.entity';

export const dataSourceOptions: DataSourceOptions = {
  // TypeORM PostgreSQL DB Drivers
  type: dbConfig.DB_DRIVER,
  host: dbConfig.DB_HOST,
  port: dbConfig.DB_PORT,
  username: dbConfig.DB_USERNAME,
  password: dbConfig.DB_PASSWORD,
  database: dbConfig.DB_DATABASE,
  entities: [User],
  synchronize: true,
  ssl: dbConfig.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
