import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { Software } from './entities/software.entity';
import { SoftwareController } from './software.controller';
import { SoftwareMigrationService } from '../shared/database/software-migration.service';
import { User } from './entities/user.entity';
import { Tenant } from './entities/tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Tenant, Software])],
  controllers: [UsersController, SoftwareController],
  providers: [SoftwareMigrationService],
  exports: [TypeOrmModule],
})
export class GlobalModule {}
