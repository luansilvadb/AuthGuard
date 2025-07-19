import { Module, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { GlobalModule } from './global/global.module';
import { TenantMiddleware } from './shared/database/tenant-aware-context';
import { TenantsModule } from './tenants/tenants.module';
import { SoftwareModule } from './software/software.module';
import { MiddlewareModule } from './shared/middleware/middleware.module';
import { DatabaseMaintenanceService } from './shared/database/database-maintenance.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', 'frontend', 'dist', 'spa'),
      exclude: ['/api/*'], // Corrigido: usando sintaxe moderna em vez de regex legacy
    }),
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME, // Adicionado: username estava faltando
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      schema: 'public',
      autoLoadEntities: true,
      synchronize: true,
      logging: true, // Adicionar logging para debug
    }),
    GlobalModule,
    TenantsModule,
    AuthModule,
    SoftwareModule,
    MiddlewareModule,
  ],
  controllers: [AppController],
  providers: [AppService, DatabaseMaintenanceService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TenantMiddleware).forRoutes('*');
  }
}
