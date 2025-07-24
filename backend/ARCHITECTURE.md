# AuthGuard - Arquitetura do Sistema

## 🏗️ Visão Geral da Arquitetura

O AuthGuard é um sistema de autenticação e autorização multitenancy que permite gerenciar múltiplos clientes (tenants) com isolamento completo de dados e controle granular de licenças e assinaturas.

## 🎯 Objetivos do Sistema

1. **Multitenancy por Schema**: Cada tenant possui seu próprio schema no PostgreSQL
2. **Hierarquia Matriz/Filial**: Suporte a estrutura organizacional complexa
3. **Controle de Licenças**: Sistema robusto de licenciamento de aplicações
4. **Gestão de Assinaturas**: Controle de planos e limites por tenant
5. **Isolamento de Dados**: Separação completa entre tenants
6. **Escalabilidade**: Arquitetura preparada para crescimento

## 🏢 Estrutura de Tenants

### Hierarquia
```
Super Admin (Sistema)
├── Matriz (Tenant Principal)
│   ├── Filial 1 (Sub-tenant)
│   ├── Filial 2 (Sub-tenant)
│   └── Filial N (Sub-tenant)
└── Outras Matrizes...
```

### Tipos de Tenant
- **MATRIX**: Tenant principal que pode ter filiais
- **SUB_TENANT**: Filial vinculada a uma matriz

### Status de Tenant
- **ACTIVE**: Tenant ativo e funcionando
- **INACTIVE**: Tenant inativo
- **SUSPENDED**: Tenant suspenso
- **PENDING**: Tenant aguardando ativação

## 🗄️ Estrutura do Banco de Dados

### Schema Público (public)
Contém as tabelas de controle do sistema:
- `tenants`: Informações dos tenants
- `users`: Usuários do sistema
- `subscriptions`: Assinaturas dos tenants
- `licenses`: Licenças das aplicações
- `applications`: Aplicações registradas

### Schemas dos Tenants
Cada tenant possui seu próprio schema com:
- Tabelas específicas do tenant
- Dados isolados
- Configurações personalizadas

## 🔐 Sistema de Autenticação

### JWT Token
O token JWT contém:
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "role": "admin",
  "tenantId": "tenant-uuid",
  "tenantSchema": "tenant_schema_name"
}
```

### Roles e Permissões
- **SUPER_ADMIN**: Acesso total ao sistema
- **ADMIN**: Administrador do tenant
- **USER**: Usuário comum

## 🏗️ Arquitetura de Módulos

### 1. Auth Module
- Autenticação e autorização
- Geração e validação de JWT
- Registro e login de usuários

### 2. Tenant Module
- Gestão de tenants
- Criação de schemas
- Hierarquia matriz/filial

### 3. User Module
- Gestão de usuários por tenant
- Controle de roles e status
- Estatísticas de usuários

### 4. Subscription Module (Futuro)
- Gestão de assinaturas
- Planos e limites
- Controle de preços

### 5. License Module (Futuro)
- Controle de licenças
- Validação de aplicações
- Gestão de instâncias

### 6. Application Module (Futuro)
- Registro de aplicações
- Configurações OAuth2
- Permissões específicas

## 🔄 Fluxo de Requisições

### 1. Autenticação
```
Cliente → AuthController → AuthService → JWT Token
```

### 2. Requisição Autenticada
```
Cliente → TenantGuard → TenantSchemaInterceptor → Controller → Service
```

### 3. Resolução de Tenant
1. **Header**: `x-tenant-id` ou `x-tenant-schema`
2. **Domain**: Resolução por domínio
3. **Validação**: Status do tenant
4. **Schema**: Configuração do schema

## 🛡️ Segurança

### Guards
- **TenantGuard**: Validação de tenant
- **JwtAuthGuard**: Autenticação JWT
- **LocalAuthGuard**: Autenticação local

### Interceptors
- **TenantSchemaInterceptor**: Configuração de schema dinâmico

### Decorators
- **@CurrentTenant()**: Informações do tenant atual
- **@TenantId()**: ID do tenant
- **@TenantSchema()**: Schema do tenant

## 📊 Estrutura de Dados

### Tenant
```typescript
{
  id: string;
  name: string;
  schema_name: string;
  domain: string;
  type: TenantType;
  status: TenantStatus;
  parent_tenant_id?: string;
  settings: Record<string, any>;
  metadata: Record<string, any>;
}
```

### User
```typescript
{
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  tenant_id: string;
  profile: Record<string, any>;
  preferences: Record<string, any>;
}
```

### Subscription
```typescript
{
  id: string;
  tenant_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  start_date: Date;
  end_date: Date;
  max_users: number;
  max_apps: number;
  monthly_price: number;
  features: Record<string, any>;
  limits: Record<string, any>;
}
```

### License
```typescript
{
  id: string;
  license_key: string;
  subscription_id: string;
  application_id?: string;
  type: LicenseType;
  status: LicenseStatus;
  issued_date: Date;
  expiry_date: Date;
  max_instances: number;
  current_instances: number;
  features: Record<string, any>;
  restrictions: Record<string, any>;
}
```

### Application
```typescript
{
  id: string;
  name: string;
  description?: string;
  type: ApplicationType;
  status: ApplicationStatus;
  tenant_id: string;
  client_id?: string;
  client_secret?: string;
  redirect_uris?: string;
  config: Record<string, any>;
  permissions: Record<string, any>;
  metadata: Record<string, any>;
}
```

## 🔄 Consultas Entre Matriz e Filial

### Estratégias de Consulta

#### 1. Consulta Hierárquica
```sql
-- Buscar dados de todas as filiais de uma matriz
SELECT * FROM public.tenants 
WHERE parent_tenant_id = 'matriz-id';
```

#### 2. Consulta Agregada
```sql
-- Estatísticas consolidadas
SELECT 
  t.name as tenant_name,
  COUNT(u.id) as total_users,
  COUNT(a.id) as total_apps
FROM public.tenants t
LEFT JOIN public.users u ON u.tenant_id = t.id
LEFT JOIN public.applications a ON a.tenant_id = t.id
WHERE t.parent_tenant_id = 'matriz-id'
GROUP BY t.id, t.name;
```

#### 3. Consulta Cross-Schema
```sql
-- Dados de múltiplos schemas
SELECT * FROM (
  SELECT 'matriz' as source, * FROM matriz_schema.users
  UNION ALL
  SELECT 'filial1' as source, * FROM filial1_schema.users
  UNION ALL
  SELECT 'filial2' as source, * FROM filial2_schema.users
) combined_data;
```

## 🚀 Escalabilidade

### Estratégias de Escalabilidade

#### 1. Horizontal
- Múltiplas instâncias da aplicação
- Load balancer
- Cache distribuído

#### 2. Vertical
- Otimização de queries
- Índices estratégicos
- Particionamento de dados

#### 3. Banco de Dados
- Read replicas
- Sharding por tenant
- Backup e recovery

## 🔧 Configuração e Deploy

### Variáveis de Ambiente
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=authguard

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# Application
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
```

### Scripts de Deploy
```bash
# Build
npm run build

# Migrations
npm run migration:run

# Seeds
npm run seed:run

# Start
npm run start:prod
```

## 📈 Monitoramento

### Métricas Importantes
- Número de tenants ativos
- Usuários por tenant
- Performance de queries
- Uso de recursos
- Taxa de erro

### Logs
- Acesso de usuários
- Criação de tenants
- Operações críticas
- Erros de sistema

## 🔮 Roadmap

### Fase 1 (Atual)
- ✅ Estrutura básica
- ✅ Autenticação JWT
- ✅ Gestão de tenants
- ✅ Gestão de usuários

### Fase 2 (Próxima)
- 🔄 Módulo de assinaturas
- 🔄 Módulo de licenças
- 🔄 Módulo de aplicações
- 🔄 Sistema de permissões granular

### Fase 3 (Futura)
- 📋 Webhooks
- 📋 Auditoria completa
- 📋 Dashboard administrativo
- 📋 API de terceiros

### Fase 4 (Avançada)
- 📋 Machine Learning
- 📋 Analytics avançado
- 📋 Integração com SSO
- 📋 Microserviços

## 🤝 Contribuição

Para contribuir com o projeto:

1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente seguindo os padrões
4. Adicione testes
5. Documente as mudanças
6. Abra um Pull Request

## 📚 Recursos Adicionais

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT.io](https://jwt.io/) 