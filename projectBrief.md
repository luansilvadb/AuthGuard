# Documentação Técnica: Implementação de Sistema Multitenant com NestJS e PostgreSQL

## Visão Geral da Arquitetura

O sistema utiliza uma abordagem híbrida de multitenancy com:

- Um **schema global** para dados compartilhados (usuários, metadados de tenants)
- **Schemas isolados por tenant** para dados específicos
- **Conexões dinâmicas** gerenciadas pelo NestJS

---

## Pré-requisitos e Configuração Inicial

### Dependências necessárias

```bash
npm install -g @nestjs/cli
nest new saas-backend
cd saas-backend
npm install @nestjs/typeorm typeorm pg @nestjs/config
```

### Variáveis de Ambiente (.env)

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=secret
DB_NAME=saas_main
```

---

## Estrutura de Pastas

```text
src/
├── global/
│   ├── entities/
│   │   ├── user.entity.ts
│   │   └── tenant.entity.ts
│   └── global.module.ts
├── tenants/
│   ├── dto/
│   │   └── create-tenant.dto.ts
│   ├── tenants.controller.ts
│   ├── tenants.service.ts
│   └── tenants.module.ts
├── shared/
│   └── database/
│       ├── tenant-connection.ts
│       └── tenant-aware-context.ts
├── app.module.ts
└── main.ts
```

---

## Implementação das Entidades Globais

### `user.entity.ts`

```ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Tenant } from './tenant.entity';

@Entity({ schema: 'global' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @OneToMany(() => Tenant, tenant => tenant.owner)
  tenants: Tenant[];
}
```

### `tenant.entity.ts`

```ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity({ schema: 'global' })
export class Tenant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @ManyToOne(() => User, user => user.tenants)
  owner: User;
}
```

---

## Gerenciamento Dinâmico de Conexões

### `tenant-connection.ts`

```ts
import { DataSource, DataSourceOptions } from 'typeorm';

const tenantDataSources: Map<string, DataSource> = new Map();

export const getTenantConnection = (tenantSlug: string): DataSource => {
  const schemaName = `tenant_${tenantSlug}`;
  
  if (tenantDataSources.has(schemaName)) {
    return tenantDataSources.get(schemaName)!;
  }

  const options: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    schema: schemaName,
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: true,
  };

  const dataSource = new DataSource(options);
  dataSource.initialize();
  tenantDataSources.set(schemaName, dataSource);
  
  return dataSource;
};
```

---

## Middleware de Contexto do Tenant

### `tenant-aware-context.ts`

```ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { getTenantConnection } from './tenant-connection';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const tenantSlug = req.headers['x-tenant-slug'] || req.query.tenant_slug;
    
    if (tenantSlug) {
      const tenantConnection = getTenantConnection(tenantSlug.toString());
      req['tenantConnection'] = tenantConnection;
    }
    
    next();
  }
}
```

---

## Implementação do Serviço de Tenants

### `tenants.service.ts`

```ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Tenant } from '../global/entities/tenant.entity';
import { User } from '../global/entities/user.entity';
import { getTenantConnection } from '../shared/database/tenant-connection';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    private dataSource: DataSource,
  ) {}

  async createTenant(userId: number, name: string): Promise<Tenant> {
    const user = await this.dataSource
      .getRepository(User)
      .findOneBy({ id: userId });

    const tenantSlug = `tenant-${Date.now()}`;
    
    const tenant = this.tenantRepository.create({
      name,
      slug: tenantSlug,
      owner: user,
    });

    await this.tenantRepository.save(tenant);
    await this.createTenantSchema(tenantSlug);
    
    return tenant;
  }

  private async createTenantSchema(schemaName: string): Promise<void> {
    await this.dataSource.query(`CREATE SCHEMA IF NOT EXISTS "${schemaName}"`);
    const tenantConnection = getTenantConnection(schemaName);
    
    await tenantConnection.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL
      )
    `);
  }
}
```

---

## Controller e DTO

### `create-tenant.dto.ts`

```ts
export class CreateTenantDto {
  name: string;
}
```

### `tenants.controller.ts`

```ts
import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createTenantDto: CreateTenantDto, @Req() req) {
    return this.tenantService.createTenant(
      req.user.id,
      createTenantDto.name
    );
  }
}
```

---

## Configuração Global do Módulo

### `app.module.ts`

```ts
import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TenantMiddleware } from './shared/database/tenant-aware-context';
import { GlobalModule } from './global/global.module';
import { TenantsModule } from './tenants/tenants.module';
import { User } from './global/entities/user.entity';
import { Tenant } from './global/entities/tenant.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      schema: 'global',
      entities: [User, Tenant],
      autoLoadEntities: true,
      synchronize: true,
    }),
    GlobalModule,
    TenantsModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .forRoutes('*');
  }
}
```

---

## Fluxo de Operações

### 1. Criar Tenant

```bash
POST /auth/login
{
  "email": "user@example.com",
  "password": "senhasecreta"
}

POST /tenants
Authorization: Bearer <TOKEN_JWT>
Content-Type: application/json

{
  "name": "Meu Primeiro Tenant"
}
```

**Resposta:**

```json
{
  "id": 1,
  "name": "Meu Primeiro Tenant",
  "slug": "tenant-171234567890"
}
```

---

### 2. Acessar Dados do Tenant Específico

```bash
GET /products
X-Tenant-Slug: tenant-171234567890
```

---

## Tarefas Pós-Implementação

- [ ] Implementar autenticação JWT  
- [ ] Criar migrações de banco de dados  
- [ ] Implementar validação de permissões  
- [ ] Adicionar connection pooling  
- [ ] Escrever testes unitários e e2e  
