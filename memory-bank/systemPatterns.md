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
## Padrões de Design AuthGuard Enterprise

### Paleta de Cores Principal
- **Azul Primário**: #1e40af, #1e3a8a, #1e293b
- **Azul Secundário**: #3b82f6, #1d4ed8
- **Verde (Registro)**: #059669, #047857, #064e3b
- **Neutros**: #f8fafc, #1f2937, #6b7280

### Componentes Padrão
- **Two-Side Layout**: Painel informativo + formulário
- **Glassmorphism**: backdrop-filter blur com transparência
- **Transições**: cubic-bezier(0.4, 0, 0.2, 1)
- **Animações**: Fade-in sequencial com delays escalonados
- **Micro-interações**: Hover com translateY(-2px) e box-shadow

### Tipografia
- **Títulos**: 28-32px, font-weight: 700
- **Subtítulos**: 16-20px, font-weight: 600
- **Texto corpo**: 14-16px, line-height: 1.6
- **Gradientes de texto**: Para elementos destacados

### Responsividade
- **Desktop**: Layout horizontal two-side
- **Mobile**: Stack vertical com animações adaptadas
- **Breakpoints**: 768px, 480px