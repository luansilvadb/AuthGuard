import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Software } from '../global/entities/software.entity';
import { SoftwareService } from './software.service';
import { SoftwareController } from './software.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Software])],
  providers: [SoftwareService],
  controllers: [SoftwareController],
  exports: [SoftwareService],
})
export class SoftwareModule {} 