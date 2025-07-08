# System Patterns *Optional*

This file documents recurring patterns and standards used in the project.
It is optional, but recommended to be updated as the project evolves.
2025-07-08 06:18:20 - Log of updates made.

*

## Coding Patterns

* Uso de DTOs para validação de entrada e tipagem
* Separação de módulos por domínio (global, tenants, shared)
* Middleware para injeção de contexto do tenant

## Architectural Patterns

* Multitenancy híbrido: schema global + schemas isolados por tenant
* Gerenciamento dinâmico de conexões com TypeORM
* Modularização do backend com NestJS

## Testing Patterns

* Planejamento para testes unitários e e2e (a implementar)