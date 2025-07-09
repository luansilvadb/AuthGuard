import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Tenant } from './entities/tenant.entity';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Tenant])],
  controllers: [UsersController],
  exports: [TypeOrmModule],
})
export class GlobalModule {}
