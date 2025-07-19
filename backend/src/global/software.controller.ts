import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Software } from './entities/software.entity';

@Controller('software')
export class SoftwareController {
  constructor(
    @InjectRepository(Software)
    private readonly softwareRepository: Repository<Software>,
  ) {}

  @Get()
  async findAll(): Promise<Software[]> {
    return this.softwareRepository.find();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Software | null> {
    return this.softwareRepository.findOneBy({ id });
  }

  @Post()
  async create(@Body() data: Partial<Software>): Promise<Software> {
    const software = this.softwareRepository.create(data);
    return this.softwareRepository.save(software);
  }
}
