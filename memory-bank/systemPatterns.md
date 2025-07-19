# System Patterns - AuthGuard

## Padrões Arquiteturais

### Multitenancy Híbrido com Múltiplos Softwares

- **Schema Global (public)**: Dados compartilhados (users, tenants, software)
- **Schemas por Software + Tenant**: `software_{code}_tenant_{slug}` (ex: `software_erp_tenant_empresa1`)
- **Conexões Dinâmicas**: Gerenciamento automático de conexões por software e tenant
- **Controle de Licenças**: Sistema de permissões por software e tenant

### Estrutura de Schemas

```
public (dados globais)
├── users                    # Usuários do sistema
├── tenants                  # Empresas/tenants
├── software                 # Catálogo de softwares disponíveis
├── software_licenses        # Licenças por empresa/software
├── user_software_access     # Controle de acesso por usuário/software
├── permissions              # Permissões globais
├── roles                    # Papéis globais
├── languages                # Idiomas disponíveis
└── settings                 # Configurações globais

software_erp_tenant_empresa1 (dados isolados)
├── branches                 # Filiais do ERP
├── departments              # Departamentos do ERP
├── tenant_users             # Usuários específicos do ERP
├── user_branches            # Relacionamento usuário-filial
├── user_departments         # Relacionamento usuário-departamento
├── audit_logs               # Logs de auditoria do ERP
├── tenant_settings          # Configurações específicas do ERP
├── permissions              # Permissões específicas do ERP
└── user_permissions         # Relacionamento usuário-permissões

software_crm_tenant_empresa1 (dados isolados)
├── customers                # Clientes do CRM
├── leads                    # Leads do CRM
├── opportunities            # Oportunidades do CRM
├── tenant_users             # Usuários específicos do CRM
├── audit_logs               # Logs de auditoria do CRM
├── tenant_settings          # Configurações específicas do CRM
├── permissions              # Permissões específicas do CRM
└── user_permissions         # Relacionamento usuário-permissões
```

### Estrutura de Módulos NestJS

```
src/
├── global/                  # Entidades e dados compartilhados
├── auth/                   # Autenticação e autorização
├── tenants/                # Gerenciamento de tenants
├── users/                  # Gerenciamento de usuários
├── software/               # Gerenciamento de softwares
│   ├── erp/               # Módulo específico do ERP
│   ├── crm/               # Módulo específico do CRM
│   └── vendas/            # Módulo específico de Vendas
├── shared/                 # Utilitários e middlewares
└── app.module.ts           # Módulo raiz
```

### Padrões de Banco de Dados

- **Nomenclatura**: `software_{code}_tenant_{slug}` para schemas isolados
- **Relacionamentos**: FK entre schemas quando necessário
- **Migrações**: Automáticas por software e tenant
- **Backup**: Por schema individual
- **Licenças**: Controle por schema de tenant

## Padrões de Código

### Backend (NestJS)

```typescript
// DTOs para validação
export class CreateSoftwareLicenseDto[object Object]
  @IsString()
  @IsNotEmpty()
  softwareCode: string;

  @IsNumber()
  @IsPositive()
  maxUsers: number;

  @IsDateString()
  expiresAt: string;
}

// Entidades com TypeORM
@Entity()
export class Software {
  @PrimaryGeneratedColumn()
  id: number;

  @Column([object Object] unique: true })
  code: string;

  @Column()
  name: string;
}

@Entity()
export class SoftwareLicense {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Tenant)
  tenant: Tenant;

  @ManyToOne(() => Software)
  software: Software;

  @Column([object Object] default: 'active' })
  status: string;

  @Column()
  maxUsers: number;

  @Column()
  expiresAt: Date;
}

// Services com injeção de dependência
@Injectable()
export class SoftwareService[object Object]  constructor(
    @InjectRepository(Software)
    private softwareRepository: Repository<Software>,
    @InjectRepository(SoftwareLicense)
    private licenseRepository: Repository<SoftwareLicense>
  ) {}
}
```

### Frontend (Vue3 + Quasar + Ant Design)

```typescript
// Composables para lógica reutilizável
export const useSoftware = () => {
  const softwares = ref<Software[]>([])
  const licenses = ref<SoftwareLicense[]>([])
  const loading = ref(false)

  const fetchSoftwares = async () => {
    loading.value = true
    // API call
    loading.value = false
  }

  return { softwares, licenses, loading, fetchSoftwares }
}

// Componentes com TypeScript
interface Software {
  id: number
  code: string
  name: string
  description: string
  isActive: boolean
}

interface SoftwareLicense {
  id: number
  tenantId: number
  softwareId: number
  status: 'active' | suspended' | 'expired'
  maxUsers: number
  expiresAt: string
}
```

## Padrões de Design UI/UX

### Paleta de Cores Principal

- **Azul Primário**: #1e40f, #1e38, #1e293 **Azul Secundário**: #3b826, #2563b, #14- **Verde (Sucesso)**: #59669, #047857, #064e3b
- **Vermelho (Erro)**: #dc2626, #b911, #991b1b
- **Neutros**: #f8fafc, #1f2937827## Componentes Padrão
- **Layout**: Two-side com painel informativo + formulário
- **Modais**: Ant Design Modal com validação
- **Tabelas**: Ant Design Table com paginação e filtros
- **Formulários**: Ant Design Form com validação
- **Feedback**: Ant Design Message e Notification

### Micro-interações

- **Hover**: translateY(-2px) + box-shadow
- **Transições**: cubic-bezier(0.40.21)
- **Loading**: Skeleton loaders
- **Feedback**: Toast notifications

## Padrões de Segurança

### Autenticação

- **JWT**: Tokens com expiração configurável
- **Refresh**: Tokens de renovação automática
- **Logout**: Invalidação de tokens

### Autorização

- **Software Access**: Verificação de acesso por software
- **License Validation**: Verificação de licenças ativas
- **Roles**: Hierarquia de permissões por software
- **Permissions**: Permissões granulares por recurso
- **Middleware**: Verificação automática por rota

### Auditoria

- **Logs**: Todas as ações importantes
- **Context**: Software, tenant, usuário, timestamp
- **Retenção**: Configurável por software e tenant

## Padrões de API

### RESTful Endpoints

```
# Gestão de Softwares
GET    /api/software                    # Listar softwares
POST   /api/software                    # Criar software
GET    /api/software/:id                # Buscar software
PUT    /api/software/:id                # Atualizar software
DELETE /api/software/:id                # Deletar software

# Gestão de Licenças
GET    /api/software-licenses           # Listar licenças
POST   /api/software-licenses           # Criar licença
GET    /api/software-licenses/:id       # Buscar licença
PUT    /api/software-licenses/:id       # Atualizar licença
DELETE /api/software-licenses/:id       # Deletar licença

# Acesso por Software
GET    /api/software/:code/dashboard    # Dashboard do software
GET    /api/software/:code/users        # Usuários do software
POST   /api/software/:code/users        # Adicionar usuário ao software
```

### Respostas Padrão

```typescript
// Sucesso[object Object]
  success: true,
  data: T,
  message?: string
}

// Erro
[object Object]  success: false,
  error: [object Object]    code: string,
    message: string,
    details?: any
  }
}
```

### Headers Padrão

- `Authorization: Bearer <token>`
- `X-Software-Code: <software_code>`
- `X-Tenant-Slug: <tenant_slug>`
- `Content-Type: application/json`

## Padrões de Estado

### Frontend (Pinia)

```typescript
// Stores modulares
export const useAuthStore = defineStore(auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    currentSoftware: null as Software | null,
    currentTenant: null as Tenant | null
  }),

  actions: {
    async login(credentials: LoginDto) {
      // Login logic
    },

    async switchSoftware(softwareCode: string)[object Object]// Switch software logic
    }
  }
})

export const useSoftwareStore = defineStore('software', {
  state: () => ({
    softwares: as Software[],
    licenses: [] as SoftwareLicense[],
    loading: false
  }),

  actions:[object Object]   async fetchSoftwares() {
      // Fetch softwares logic
    },

    async createLicense(licenseData: CreateSoftwareLicenseDto)[object Object] // Create license logic
    }
  }
})
```

### Backend (Context)

```typescript
// Context por request
export interface RequestContext [object Object]
  tenant: Tenant
  user: User
  software: Software
  license: SoftwareLicense
  connection: DataSource
}
```

## Padrões de Teste

### Unit Tests

- **Services**: Lógica de negócio
- **Controllers**: Endpoints da API
- **DTOs**: Validação de entrada

### Integration Tests

- **Database**: Operações CRUD
- **Auth**: Fluxos de autenticação
- **Multitenancy**: Isolamento de dados
- **Software Access**: Controle de acesso por software

### E2E Tests

- **User Flows**: Fluxos completos
- **UI**: Interações de usuário
- **API**: End-to-end requests
- **Software Switching**: Troca entre softwares

## Padrões de Deploy

### Ambiente de Desenvolvimento

- **Hot Reload**: NestJS + Quasar
- **Database**: PostgreSQL local
- **Variables**: .env files

### Ambiente de Produção

- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **Database**: PostgreSQL cluster
- **Monitoring**: Prometheus + Grafana

## Padrões de Performance

### Cache

- **Redis**: Cache distribuído
- **Memory**: Cache local por software e tenant
- **CDN**: Assets estáticos

### Database

- **Indexes**: Otimização de queries
- **Connection Pool**: Reutilização de conexões
- **Query Optimization**: N+1 prevention
- **Schema Isolation**: Performance por software

### Frontend

- **Lazy Loading**: Componentes sob demanda
- **Code Splitting**: Bundles otimizados
- **Image Optimization**: WebP + lazy loading
- **Software-specific**: Assets por software
