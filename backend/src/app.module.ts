import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { DataSource } from 'typeorm';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { GlobalModule } from './global/global.module';
import { Tenant } from './global/entities/tenant.entity';
import { TenantMiddleware } from './shared/database/tenant-aware-context';
import { TenantsModule } from './tenants/tenants.module';
import { User } from './global/entities/user.entity';

const createGlobalSchema = {
  provide: 'GLOBAL_SCHEMA',
  useFactory: async () => {
    const dataSource = new DataSource({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
    });
    await dataSource.initialize();
    await dataSource.query('CREATE SCHEMA IF NOT EXISTS global');
    await dataSource.destroy();
  },
};

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'frontend', 'dist', 'spa'),
      exclude: ['/api/(.*)'],
    }),
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      schema: 'global',
      entities: [User, Tenant],
      autoLoadEntities: true,
      synchronize: true,
    }),
    GlobalModule,
    TenantsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, createGlobalSchema],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
