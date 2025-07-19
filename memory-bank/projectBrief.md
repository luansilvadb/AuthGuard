# AuthGuard - Sistema SaaS Multitenant

## Visão Geral

O **AuthGuard** é um sistema SaaS multitenant completo que oferece gerenciamento de autenticação, autorização e controle de acesso para múltiplas organizações (tenants) em uma única instância.

## Objetivos Principais

1. **Multitenancy Híbrido**: Schema global para dados compartilhados + schemas isolados por tenant
2. **Segurança Enterprise**: Autenticação JWT, roles, permissões e auditoria
3. **UX Profissional**: Interface moderna com padrões Ant Design + Quasar
4. **Escalabilidade**: Arquitetura modular e gerenciamento dinâmico de conexões

## Stack Tecnológica

### Backend

- **Framework**: NestJS
- **Banco de Dados**: PostgreSQL
- **ORM**: TypeORM
- **Autenticação**: JWT
- **Validação**: class-validator, class-transformer

### Frontend

- **Framework**: Vue3sar
- **UI Library**: Ant Design Vue
- **Estado**: Pinia
- **Roteamento**: Vue Router
- **HTTP Client**: Axios
- **Internacionalização**: Vue I18

## Arquitetura do Sistema

### Estrutura de Dados

```
Database
├── global (schema compartilhado)
│   ├── users
│   ├── tenants
│   └── roles
└── tenant_{slug} (schemas isolados)
    ├── permissions
    ├── audit_logs
    └── tenant_specific_data
```

### Módulos Principais

- **Global**: Usuários, tenants, configurações compartilhadas
- **Auth**: Autenticação, autorização, JWT
- **Tenants**: Gerenciamento de organizações
- **Users**: Gerenciamento de usuários por tenant
- **Shared**: Utilitários, middlewares, filtros

## Funcionalidades Core

### ✅ Implementadas

- CRUD completo de Tenants (frontend)
- Interface enterprise com Ant Design
- Estrutura multitenant no backend
- Autenticação JWT básica
- Gerenciamento dinâmico de conexões

### 🚧 Em Desenvolvimento

- Integração frontend-backend
- Sistema de roles e permissões
- Auditoria e logs
- Notificações em tempo real

### 📋 Planejadas

- Dashboard analítico
- Relatórios de segurança
- API de integração
- Backup e recuperação
- Monitoramento e alertas

## Padrões de Desenvolvimento

### Frontend

- Componentes reutilizáveis
- Tipagem TypeScript completa
- Padrões Ant Design enterprise
- Responsividade mobile-first
- Micro-interações e feedback visual

### Backend

- Arquitetura modular NestJS
- DTOs para validação
- Middleware para contexto tenant
- Tratamento de exceções centralizado
- Logs estruturados

## Configuração e Deploy

### Variáveis de Ambiente

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=secret
DB_NAME=authguard_main

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# App
PORT=3000
NODE_ENV=development
```

### Scripts de Desenvolvimento

```bash
# Backend
npm run start:dev
npm run build
npm run test

# Frontend
quasar dev
quasar build
quasar test
```

## Roadmap

### Fase1: Core (Atual)

- ✅ CRUD Tenants
- 🔄 Integração frontend-backend
- 🔄 Sistema de autenticação completo

### Fase 2: Segurança

- Sistema de roles e permissões
- Auditoria e logs
- 2FA e MFA

### Fase 3: Enterprise

- Dashboard analítico
- Relatórios avançados
- API de integração

### Fase4: Escala

- Cache e performance
- Monitoramento
- Backup automático
