# Decision Log - AuthGuard

## Decisões Arquiteturais

###20251XX: Multitenancy Híbrido
**Decisão**: Implementar arquitetura multitenant híbrida com schema global + schemas isolados
**Contexto**: Necessidade de isolamento de dados entre tenants mantendo dados compartilhados
**Alternativas Consideradas**:

- Database per tenant (muito custoso)
- Single schema com tenant_id (menos seguro)
- Schema per tenant (escolhido)

**Consequências**:

- ✅ Isolamento completo de dados
- ✅ Performance otimizada por tenant
- ✅ Facilidade de backup individual
- ⚠️ Complexidade de gerenciamento de conexões

###20251XX: Stack Frontend - Vue3 + Quasar + Ant Design
**Decisão**: Usar Vue3m Quasar CLI e Ant Design Vue como UI library
**Contexto**: Necessidade de interface moderna e responsiva com componentes enterprise
**Alternativas Consideradas**:

- React + Material-UI (mais popular)
- Angular + Angular Material (mais robusto)
- Vue3 + Quasar + Ant Design (escolhido)

**Consequências**:

- ✅ Desenvolvimento rápido com Quasar CLI
- ✅ Componentes enterprise prontos (Ant Design)
- ✅ Tipagem TypeScript nativa
- ✅ Ecossistema Vue maduro

### 20251XX: Autenticação JWT

**Decisão**: Implementar autenticação baseada em JWT tokens
**Contexto**: Necessidade de autenticação stateless e escalável
**Alternativas Consideradas**:

- Session-based (mais simples)
- OAuth2 (mais complexo)
- JWT (escolhido)

**Consequências**:

- ✅ Stateless e escalável
- ✅ Fácil integração com APIs
- ✅ Suporte a refresh tokens
- ⚠️ Complexidade de invalidação

###2025-1-XX: Fluxo de Criação de Tenant
**Decisão**: Implementar redirecionamento inteligente pós-login baseado na existência de tenants
**Contexto**: Usuários novos precisam criar seu primeiro tenant antes de usar o sistema
**Implementação**:

- Login retorna usuário com lista de tenants
- Se não há tenants, redireciona para /create-tenant
- Se há tenants, redireciona para /dashboard
- Página de criação integrada com API real

**Consequências**:

- ✅ UX fluida para novos usuários
- ✅ Onboarding automático
- ✅ Integração completa com backend
- ✅ Feedback visual adequado

## Decisões de Design

###2025 Padrão Ant Design Enterprise
**Decisão**: Seguir rigorosamente os padrões Ant Design para interface
**Contexto**: Necessidade de interface profissional e consistente
**Justificativa**:

- Componentes testados e aprovados
- Documentação excelente
- Padrões enterprise estabelecidos
- Suporte a TypeScript nativo

###2251X: Paleta de Cores Azul
**Decisão**: Usar azul como cor primária do sistema
**Contexto**: Necessidade de identidade visual profissional
**Justificativa**:

- Azul transmite confiança e segurança
- Padrão em sistemas enterprise
- Boa acessibilidade
- Fácil customização

### 20251XX: Página de Criação de Tenant

**Decisão**: Criar página dedicada para criação de tenant inspirada em referências modernas
**Contexto**: Necessidade de interface intuitiva para onboarding de novos usuários
**Implementação**:

- Layout centralizado com card
- Campos: nome, região de dados, colaboradores
- Seleção visual de regiões
- Botão de ação destacado
- Loading states e validação

**Consequências**:

- ✅ Interface moderna e intuitiva
- ✅ UX consistente com padrões enterprise
- ✅ Validação em tempo real
- ✅ Feedback visual adequado

## Decisões Técnicas

###2025 TypeScript Strict Mode
**Decisão**: Usar TypeScript em modo strict em todo o projeto
**Contexto**: Necessidade de código robusto e tipado
**Consequências**:

- ✅ Detecção precoce de erros
- ✅ Melhor IntelliSense
- ✅ Refatoração mais segura
- ⚠️ Mais código boilerplate

###2025: Pinia para State Management
**Decisão**: Usar Pinia ao invés de Vuex para gerenciamento de estado
**Contexto**: Necessidade de state management moderno e tipado
**Justificativa**:

- API mais simples e intuitiva
- Melhor suporte a TypeScript
- Menos boilerplate
- Performance superior

###225X: Axios para HTTP Client
**Decisão**: Usar Axios para requisições HTTP
**Contexto**: Necessidade de cliente HTTP robusto e configurável
**Justificativa**:

- Interceptors poderosos
- Tratamento de erros robusto
- Configuração flexível
- Suporte a TypeScript

###2025-1XX: Integração API de Criação de Tenant
**Decisão**: Integrar formulário de criação com API real usando token JWT
**Contexto**: Necessidade de persistência real dos dados de tenant
**Implementação**:

- Usar token salvo em cookie
- Headers de autorização automáticos
- Tratamento de erros centralizado
- Redirecionamento após sucesso

**Consequências**:

- ✅ Persistência real de dados
- ✅ Segurança com JWT
- ✅ Feedback de erro adequado
- ✅ UX fluida pós-criação

## Decisões de UX/UI

### 20251XX: Modais para CRUD

**Decisão**: Usar modais para operações de criação e edição
**Contexto**: Necessidade de UX fluida sem mudança de página
**Alternativas Consideradas**:

- Páginas separadas (mais espaço)
- Modais (escolhido)
- Drawers (menos comum)

**Consequências**:

- ✅ UX mais fluida
- ✅ Menos navegação
- ⚠️ Espaço limitado em mobile

### 225X: Popconfirm para Exclusão

**Decisão**: Usar Popconfirm ao invés de modal para confirmação de exclusão
**Contexto**: Necessidade de confirmação rápida e não intrusiva
**Justificativa**:

- Menos intrusivo que modal
- Confirmação contextual
- Padrão Ant Design
- UX mais fluida

### 20251X: Página Dedicada para Criação de Tenant

**Decisão**: Criar página separada ao invés de modal para criação de tenant
**Contexto**: Processo de onboarding é crítico e merece foco total
**Justificativa**:

- Foco total no processo
- Mais espaço para campos
- Melhor UX para novos usuários
- Redirecionamento natural

## Decisões de Performance

### 2025-1X: Lazy Loading de Componentes

**Decisão**: Implementar lazy loading para componentes pesados
**Contexto**: Necessidade de performance otimizada
**Implementação**:

- Lazy loading de páginas
- Skeleton loaders
- Debounce em filtros
- Virtual scrolling para tabelas grandes

###2025XX: Cache de Dados
**Decisão**: Implementar cache local para dados frequentemente acessados
**Contexto**: Reduzir requisições desnecessárias
**Estratégia**:

- Cache de tenants no Pinia
- Cache de configurações
- Invalidação inteligente
- Cache por tenant

## Decisões de Segurança

###20251X: Validação Dupla
**Decisão**: Validar dados tanto no frontend quanto no backend
**Contexto**: Segurança em camadas
**Implementação**:

- Frontend: Validação em tempo real
- Backend: DTOs com class-validator
- Sanitização de entrada
- Escape de saída

### 225XX: Headers de Segurança

**Decisão**: Implementar headers de segurança HTTP
**Contexto**: Proteção contra ataques comuns
**Headers**:

- Content-Security-Policy
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security

## Decisões de Deploy

### 20251ker para Containerização

**Decisão**: Usar Docker para containerização da aplicação
**Contexto**: Facilidade de deploy e consistência de ambiente
**Benefícios**:

- Ambiente consistente
- Deploy simplificado
- Escalabilidade
- Isolamento de dependências

### 225X: PostgreSQL como Database

**Decisão**: Usar PostgreSQL como banco de dados principal
**Contexto**: Necessidade de banco robusto com suporte a schemas
**Justificativa**:

- Suporte nativo a schemas
- Performance excelente
- Recursos avançados
- Comunidade ativa

## Decisões Pendentes

### 225XX: Sistema de Notificações

**Decisão**: Pendente - WebSockets vs Server-Sent Events
**Contexto**: Necessidade de notificações em tempo real
**Opções**:

- WebSockets (bidirecional)
- Server-Sent Events (unidirecional)
- Polling (simples)

###2025-XX: Cache Distribuído
**Decisão**: Pendente - Redis vs Memcached
**Contexto**: Necessidade de cache compartilhado
**Considerações**:

- Redis: Mais recursos, mais complexo
- Memcached: Mais simples, menos recursos

## Lições Aprendidas

### 2251X: Complexidade de Multitenancy

**Aprendizado**: Multitenancy adiciona complexidade significativa
**Impacto**: Mais tempo de desenvolvimento, mas benefícios claros
**Ação**: Documentar padrões e criar abstrações

### 20251XX: Importância da Tipagem

**Aprendizado**: TypeScript strict mode previne muitos bugs
**Impacto**: Desenvolvimento mais lento inicialmente, mas muito mais robusto
**Ação**: Manter strict mode e documentar tipos

### 225XX: UX Consistente

**Aprendizado**: Seguir padrões estabelecidos melhora UX
**Impacto**: Usuários se adaptam mais rapidamente
**Ação**: Manter consistência com Ant Design

### 2025-1-XX: Onboarding de Usuários

**Aprendizado**: Fluxo de onboarding é crítico para adoção
**Impacto**: Usuários novos precisam de guia claro
**Ação**: Implementar fluxos intuitivos e feedback visual

[2025-07-17 23:19:24] - **Entidades branch_data e branch_permission**: Decisão de manter `branch_data` e `branch_permission` como entidades **tenant-specific** e não globais. Elas foram movidas do diretório `global/entities` para `tenants/entities` e as configurações do TypeORM e módulos NestJS foram ajustadas para garantir que sejam carregadas apenas no contexto do schema do tenant, e não no esquema `public`. Isso reforça o isolamento de dados e a arquitetura multitenant.
