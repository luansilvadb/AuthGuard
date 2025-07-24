# AuthGuard Backend

Sistema de autenticação e autorização multitenancy com controle de licenças e assinaturas.

## 🚀 Características

- **Multitenancy por Schema**: Cada tenant possui seu próprio schema no banco de dados
- **Hierarquia de Tenants**: Suporte a matriz e filiais (sub-tenants)
- **Controle de Licenças**: Sistema robusto de licenciamento de aplicações
- **Gestão de Assinaturas**: Controle de planos e limites por tenant
- **Controle de Aplicações**: Gestão de apps vinculados aos tenants
- **Limite de Usuários**: Controle de usuários por tenant
- **Roles e Permissões**: Super Admin, Admin e User roles
- **API RESTful**: Documentação completa com Swagger

## 🏗️ Arquitetura

```
authguard/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/          # Autenticação e autorização
│   │   │   ├── tenant/        # Gestão de tenants
│   │   │   ├── user/          # Gestão de usuários
│   │   │   ├── subscription/  # Gestão de assinaturas
│   │   │   ├── license/       # Controle de licenças
│   │   │   └── app/           # Gestão de aplicações
│   │   ├── common/
│   │   │   ├── decorators/    # Decorators personalizados
│   │   │   ├── guards/        # Guards de segurança
│   │   │   ├── interceptors/  # Interceptors
│   │   │   ├── filters/       # Filtros de exceção
│   │   │   └── dto/           # Data Transfer Objects
│   │   ├── config/            # Configurações
│   │   ├── database/
│   │   │   ├── entities/      # Entidades do banco
│   │   │   ├── migrations/    # Migrações
│   │   │   └── seeds/         # Dados iniciais
│   │   └── shared/            # Utilitários compartilhados
│   └── ...
└── frontend/
```

## 🛠️ Tecnologias

- **NestJS**: Framework Node.js para aplicações escaláveis
- **TypeScript**: Linguagem de programação tipada
- **PostgreSQL**: Banco de dados relacional
- **TypeORM**: ORM para TypeScript/JavaScript
- **JWT**: Autenticação baseada em tokens
- **Swagger**: Documentação da API
- **bcryptjs**: Hash de senhas
- **class-validator**: Validação de dados

## 📋 Pré-requisitos

- Node.js (v16 ou superior)
- PostgreSQL (v12 ou superior)
- npm ou yarn

## 🔧 Instalação

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd authguard/backend
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Configure o banco de dados**
   ```bash
   # Crie o banco de dados PostgreSQL
   createdb authguard
   ```

4. **Configure as variáveis de ambiente**
   ```bash
   cp .env.example .env
   # Edite o arquivo .env com suas configurações
   ```

5. **Execute as migrações**
   ```bash
   npm run migration:run
   ```

6. **Inicie o servidor**
   ```bash
   npm run start:dev
   ```

## 🚀 Scripts Disponíveis

- `npm run start`: Inicia o servidor em produção
- `npm run start:dev`: Inicia o servidor em modo desenvolvimento
- `npm run build`: Compila o projeto
- `npm run test`: Executa os testes
- `npm run migration:generate`: Gera uma nova migração
- `npm run migration:run`: Executa as migrações
- `npm run seed:run`: Executa os seeds

## 📚 Documentação da API

Após iniciar o servidor, acesse:
- **Swagger UI**: http://localhost:3000/api/docs
- **API Base URL**: http://localhost:3000/api/v1

## 🏢 Estrutura de Tenants

### Hierarquia
```
Super Admin (Você)
├── Matriz (Tenant Principal)
│   ├── Filial 1 (Sub-tenant)
│   ├── Filial 2 (Sub-tenant)
│   └── Filial N (Sub-tenant)
```

### Roles
- **SUPER_ADMIN**: Acesso total ao sistema
- **ADMIN**: Administrador do tenant (proprietário)
- **USER**: Usuário comum do tenant

## 🔐 Autenticação

O sistema utiliza JWT para autenticação. Inclua o token no header:
```
Authorization: Bearer <your-jwt-token>
```

## 🏗️ Multitenancy

### Headers Necessários
- `x-tenant-id`: ID do tenant
- `x-tenant-schema`: Schema do tenant
- `host`: Domínio do tenant (alternativo)

### Exemplo de Request
```bash
curl -H "x-tenant-id: tenant-uuid" \
     -H "Authorization: Bearer jwt-token" \
     http://localhost:3000/api/v1/tenants/current
```

## 📊 Entidades Principais

### Tenant
- Gerencia a hierarquia matriz/filial
- Controle de status e configurações
- Schema isolado no banco de dados

### User
- Usuários por tenant
- Roles e permissões
- Perfis e preferências

### Subscription
- Planos de assinatura
- Limites de usuários e apps
- Controle de preços

### License
- Licenças por aplicação
- Controle de instâncias
- Validação de expiração

### Application
- Apps vinculados aos tenants
- Configurações OAuth2
- Permissões específicas

## 🔄 Próximos Passos

1. Implementar módulo de autenticação
2. Criar sistema de permissões granular
3. Implementar webhooks para eventos
4. Adicionar auditoria de ações
5. Criar dashboard administrativo
6. Implementar notificações
7. Adicionar testes automatizados

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC. 