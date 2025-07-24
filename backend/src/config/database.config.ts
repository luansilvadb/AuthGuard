import * as dotenv from 'dotenv';
dotenv.config();

import { DataSource, DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';
// Importação explícita das entidades
import { User } from '../database/entities/user.entity';
import { Tenant } from '../database/entities/tenant.entity';
import { Subscription } from '../database/entities/subscription.entity';
import { License } from '../database/entities/license.entity';
import { Application } from '../database/entities/application.entity';

const entities = [User, Tenant, Subscription, License, Application];

// Detecta se está rodando com ts-node (desenvolvimento) ou node (produção)
const isTsNode = process.env.TS_NODE === 'true' || process.env.NODE_ENV === 'development';
const fileExt = isTsNode ? 'ts' : 'js';

export const databaseConfig = (configService: ConfigService): DataSourceOptions => ({
  type: 'postgres',
  host: configService.get('DB_HOST', 'localhost'),
  port: configService.get('DB_PORT', 5432),
  username: configService.get('DB_USERNAME', 'postgres'),
  password: configService.get('DB_PASSWORD', 'password'),
  database: configService.get('DB_NAME', 'authguard'),
  entities,
  migrations: [__dirname + `/../database/migrations/**/*.${fileExt}`],
  synchronize: configService.get('NODE_ENV') === 'development',
  logging: configService.get('NODE_ENV') === 'development',
  ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
  migrationsRun: false, // Não executar migrações automaticamente
  migrationsTableName: 'migrations',
});

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'authguard',
  entities,
  migrations: [__dirname + `/../database/migrations/**/*.${fileExt}`],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  migrationsTableName: 'migrations',
}); 