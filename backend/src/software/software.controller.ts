import { Controller, Get, Post, Put, Delete, Param, Body, Req, UseGuards, NotFoundException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SoftwareService } from './software.service';

@Controller('software')
@UseGuards(JwtAuthGuard)
export class SoftwareController {
  constructor(private readonly softwareService: SoftwareService) {}

  @Get(':entity')
  async findAll(@Req() req, @Param('entity') entity: string) {
    return this.softwareService.findAll(req.softwareConnection, entity);
  }

  @Get(':entity/:id')
  async findOne(@Req() req, @Param('entity') entity: string, @Param('id') id: number) {
    const result = await this.softwareService.findOne(req.softwareConnection, entity, id);
    if (!result) throw new NotFoundException(`${entity} não encontrado`);
    return result;
  }

  @Post(':entity')
  async create(@Req() req, @Param('entity') entity: string, @Body() dto: any) {
    return this.softwareService.create(req.softwareConnection, entity, dto);
  }

  @Put(':entity/:id')
  async update(@Req() req, @Param('entity') entity: string, @Param('id') id: number, @Body() dto: any) {
    const result = await this.softwareService.update(req.softwareConnection, entity, id, dto);
    if (!result) throw new NotFoundException(`${entity} não encontrado`);
    return result;
  }

  @Delete(':entity/:id')
  async remove(@Req() req, @Param('entity') entity: string, @Param('id') id: number) {
    const ok = await this.softwareService.remove(req.softwareConnection, entity, id);
    if (!ok) throw new NotFoundException(`${entity} não encontrado`);
    return { success: true };
  }
} 