import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class SoftwareService {
  async findAll(dataSource: DataSource, entityName: string): Promise<any[]> {
    const repo = dataSource.getRepository(entityName);
    return repo.find();
  }

  async findOne(dataSource: DataSource, entityName: string, id: number): Promise<any | null> {
    const repo = dataSource.getRepository(entityName);
    return repo.findOneBy({ id });
  }

  async create(dataSource: DataSource, entityName: string, dto: any): Promise<any> {
    const repo = dataSource.getRepository(entityName);
    const entity = repo.create(dto);
    return repo.save(entity);
  }

  async update(dataSource: DataSource, entityName: string, id: number, dto: any): Promise<any | null> {
    const repo = dataSource.getRepository(entityName);
    const entity = await repo.findOneBy({ id });
    if (!entity) return null;
    Object.assign(entity, dto);
    return repo.save(entity);
  }

  async remove(dataSource: DataSource, entityName: string, id: number): Promise<boolean> {
    const repo = dataSource.getRepository(entityName);
    const result = await repo.delete(id);
    return !!result.affected && result.affected > 0;
  }
} 