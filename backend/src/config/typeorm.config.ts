import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { User } from '../global/entities/user.entity';
import { Tenant } from '../global/entities/tenant.entity';
import { Software } from '../global/entities/software.entity';

config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  schema: 'public',
  entities: [User, Tenant, Software],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: true,
});
