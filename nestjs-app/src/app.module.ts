// Provider para criar schema global automaticamente
import { DataSource } from 'typeorm';

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
import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TenantMiddleware } from './shared/database/tenant-aware-context';
import { GlobalModule } from './global/global.module';
import { TenantsModule } from './tenants/tenants.module';
import { User } from './global/entities/user.entity';
import { Tenant } from './global/entities/tenant.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
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
