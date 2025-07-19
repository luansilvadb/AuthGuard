import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SoftwareAccessMiddleware } from './software-access.middleware';
import { Software } from '../../global/entities/software.entity';
import { Tenant } from '../../global/entities/tenant.entity';
import { User } from '../../global/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Software, Tenant, User])],
  providers: [SoftwareAccessMiddleware],
  exports: [SoftwareAccessMiddleware],
})
export class MiddlewareModule {
  configure(consumer: MiddlewareConsumer) {
    // Aplicar SoftwareAccessMiddleware nas rotas de software genérico
    // Corrigido: usar '/software/*' em vez de '/api/software/*' para evitar padrão duplicado
    consumer.apply(SoftwareAccessMiddleware).forRoutes('/software/*');
  }
}