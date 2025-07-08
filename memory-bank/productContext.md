# Product Context

This file provides a high-level overview of the project and the expected product that will be created. Initially it is based upon projectBrief.md (if provided) and all other available project-related information in the working directory. This file is intended to be updated as the project evolves, and should be used to inform all other modes of the project's goals and context.
2025-07-08 06:18:00 - Log of updates made will be appended as footnotes to the end of this file.

*

## Project Goal

Implementar um sistema SaaS multitenant utilizando NestJS e PostgreSQL, com gerenciamento dinâmico de conexões, schemas isolados por tenant e um schema global para dados compartilhados.

## Key Features

* Suporte a múltiplos tenants com schemas isolados
* Gerenciamento dinâmico de conexões no NestJS
* Entidades globais para usuários e tenants
* Middleware para contexto do tenant via header/query
* Criação dinâmica de schemas e tabelas por tenant
* API RESTful para gerenciamento de tenants
* Autenticação JWT (a implementar)
* Migrações de banco de dados (a implementar)
* Validação de permissões (a implementar)
* Connection pooling (a implementar)
* Testes unitários e e2e (a implementar)

## Overall Architecture

* NestJS como framework backend principal
* PostgreSQL como banco de dados relacional
* Estrutura modular: global, tenants, shared/database
* Uso de TypeORM para ORM e gerenciamento de schemas
* Middleware para injeção de conexão do tenant por request
* DTOs e Controllers para endpoints REST
* Configuração via variáveis de ambiente (.env)
* Estrutura de pastas conforme especificado no projectBrief.md

[2025-08-07 08:03:28] - Atualização: O padrão visual do frontend será baseado no Ant Design, com uso complementar de componentes do Quasar quando necessário.
