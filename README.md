# AuthGuard - Sistema Multitenant B2B

Sistema completo de gestão multitenant para ecossistema SaaS B2B, desenvolvido em .NET 8 com PostgreSQL.

## 📚 Documentação

Toda a documentação detalhada do projeto está disponível na pasta **[docs](./docs/)**:

- **[📋 Índice da Documentação](./docs/README.md)** - Visão geral de toda a documentação
- **[🚀 Guia de Deploy](./docs/DEPLOYMENT.md)** - Como fazer deploy em produção
- **[🔧 Solução de Problemas](./docs/SOLUCAO-PROBLEMA.md)** - Troubleshooting e soluções
- **[🏗️ Estrutura Organizada](./docs/ESTRUTURA-ORGANIZADA.md)** - Arquitetura e organização do código

## 🏗️ Arquitetura

O projeto segue a arquitetura Clean Architecture com os seguintes projetos:

- **AuthGuard.API**: Camada de apresentação (Controllers, Middleware)
- **AuthGuard.Application**: Camada de aplicação (Commands, Queries, Handlers, DTOs)
- **AuthGuard.Domain**: Camada de domínio (Entities, Interfaces, Business Rules)
- **AuthGuard.Infrastructure**: Camada de infraestrutura (Data, Repositories, Services)

## 🚀 Tecnologias Utilizadas

- **.NET 8**: Framework principal
- **ASP.NET Core**: Web APIs
- **Entity Framework Core**: ORM para PostgreSQL
- **PostgreSQL**: Banco de dados principal
- **MediatR**: CQRS pattern
- **AutoMapper**: Object mapping
- **FluentValidation**: Validação de dados
- **Serilog**: Structured logging
- **ASP.NET Core Identity**: User management
- **JWT Bearer**: Token-based authentication

## 📋 Pré-requisitos

- .NET 8 SDK
- PostgreSQL 15+
- Visual Studio 2022 ou VS Code

## 🔧 Instalação

1. **Clone o repositório**
   ```bash
   git clone <repository-url>
   cd AuthGuard
   ```

2. **Configure o banco de dados**
   - Instale o PostgreSQL
   - Crie um banco de dados chamado `authguard`
   - Atualize a connection string no `appsettings.json`

3. **Restore os pacotes NuGet**
   ```bash
   dotnet restore
   ```

4. **Execute as migrações**
   ```bash
   cd AuthGuard.API
   dotnet ef database update
   ```

5. **Execute o projeto**
   ```bash
   dotnet run
   ```

## 🗄️ Estrutura do Banco de Dados

### Entidades Principais

- **Tenants**: Empresas principais
- **Branches**: Filiais/subsidiárias
- **Users**: Usuários do sistema
- **Software**: Softwares disponíveis no ecossistema
- **Licenses**: Controle de licenças
- **AuditLogs**: Logs de auditoria

### Relacionamentos

- Tenant → Branches (1:N)
- Tenant → Users (1:N)
- Branch → Users (1:N)
- User → Manager (N:1)
- Tenant → Software (N:N via TenantSoftware)
- Branch → Software (N:N via BranchSoftware)
- User → Software (N:N via UserSoftware)

## 🔐 Autenticação e Autorização

O sistema utiliza:
- **JWT Bearer Tokens** para autenticação
- **ASP.NET Core Identity** para gestão de usuários
- **RBAC (Role-Based Access Control)** para autorização
- **Hierarquia de usuários**: SuperAdmin → TenantOwner → BranchManager → User

## 📊 Funcionalidades Principais

### Super Admin
- Gestão de tenants
- Controle de licenças globais
- Dashboard executivo
- Deploy de novos softwares

### Tenant Owner
- Gestão de filiais
- Controle de usuários
- Billing consolidado
- Configurações da empresa

### Branch Manager
- Gestão de usuários locais
- Acesso aos softwares liberados
- Dashboards específicos da filial

### End User
- SSO entre todos os sistemas
- Interface unificada
- Acesso aos softwares autorizados

## 🛠️ Desenvolvimento

### Estrutura de Pastas

```
AuthGuard/
├── AuthGuard.API/
│   ├── Controllers/
│   ├── Program.cs
│   └── appsettings.json
├── AuthGuard.Application/
│   ├── Commands/
│   ├── Queries/
│   ├── Handlers/
│   ├── DTOs/
│   └── Mappings/
├── AuthGuard.Domain/
│   ├── Entities/
│   └── Interfaces/
└── AuthGuard.Infrastructure/
    ├── Data/
    ├── Repositories/
    └── Services/
```

### Padrões Utilizados

- **CQRS**: Separação de Commands e Queries
- **Repository Pattern**: Abstração do acesso a dados
- **Unit of Work**: Transações de banco de dados
- **Dependency Injection**: Inversão de controle
- **Audit Trail**: Logs de todas as ações

## 📝 API Endpoints

### Tenants
- `GET /api/tenants` - Listar todos os tenants
- `GET /api/tenants/{id}` - Obter tenant por ID
- `POST /api/tenants` - Criar novo tenant
- `PUT /api/tenants/{id}` - Atualizar tenant
- `DELETE /api/tenants/{id}` - Remover tenant

### Users
- `GET /api/users` - Listar usuários
- `GET /api/users/{id}` - Obter usuário por ID
- `POST /api/users` - Criar novo usuário
- `PUT /api/users/{id}` - Atualizar usuário

### Software
- `GET /api/software` - Listar softwares
- `GET /api/software/{id}` - Obter software por ID
- `POST /api/software` - Adicionar novo software

## 🔍 Logs e Monitoramento

- **Serilog**: Logs estruturados
- **Audit Trail**: Logs de todas as ações dos usuários
- **Performance Monitoring**: Métricas de performance

## 🚀 Deploy

### Docker (Recomendado)

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["AuthGuard.API/AuthGuard.API.csproj", "AuthGuard.API/"]
COPY ["AuthGuard.Application/AuthGuard.Application.csproj", "AuthGuard.Application/"]
COPY ["AuthGuard.Domain/AuthGuard.Domain.csproj", "AuthGuard.Domain/"]
COPY ["AuthGuard.Infrastructure/AuthGuard.Infrastructure.csproj", "AuthGuard.Infrastructure/"]
RUN dotnet restore "AuthGuard.API/AuthGuard.API.csproj"
COPY . .
WORKDIR "/src/AuthGuard.API"
RUN dotnet build "AuthGuard.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "AuthGuard.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "AuthGuard.API.dll"]
```

### Azure/AWS

1. Configure as variáveis de ambiente
2. Execute as migrações
3. Configure o Application Insights (Azure) ou CloudWatch (AWS)

## 📈 Métricas de Sucesso

- **Uptime**: 99.9% SLA
- **Response Time**: <200ms P95
- **User Satisfaction**: NPS >50
- **Support Tickets**: <2% of active users/month

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para suporte, envie um email para suporte@authguard.com ou abra uma issue no GitHub.

## 🔄 Roadmap

### Phase 1: Foundation (Months 1-4)
- [x] Super Admin dashboard básico
- [x] Tenant creation e management
- [x] SSO entre softwares
- [x] Basic billing integration
- [x] User hierarchy implementation

### Phase 2: Scale (Months 5-8)
- [ ] Multi-branch management
- [ ] Advanced permission system
- [ ] Usage tracking e limits
- [ ] Mobile app MVP
- [ ] Integration com 3+ softwares

### Phase 3: Intelligence (Months 9-12)
- [ ] Analytics e BI platform
- [ ] Automated billing e dunning
- [ ] API marketplace
- [ ] White-label options
- [ ] Enterprise features 