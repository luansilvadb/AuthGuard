# Decision Log

This file records architectural and implementation decisions using a list format.
2025-07-08 06:18:16 - Log of updates made.

-

## Decision

- Inicialização do Memory Bank para rastreamento de contexto e decisões do projeto.

## Rationale

- Facilitar a documentação contínua e a rastreabilidade das decisões arquiteturais.

## Implementation Details

- Criação dos arquivos productContext.md, activeContext.md e progress.md como parte da inicialização.
  [2025-08-07 08:07:53] - Decisão: Importar o CSS do Ant Design Vue globalmente em frontend/src/main.ts para garantir compatibilidade e simplicidade com Vite + Quasar.
  [2025-08-07 08:09:10] - Atualização: Decisão revisada — O CSS do Ant Design Vue foi adicionado globalmente via quasar.config.ts para garantir compatibilidade e simplicidade com Vite + Quasar.
  [2025-08-07 08:13:00] - Problema identificado: O import do CSS do Ant Design Vue via SCSS global não é resolvido pelo Vite/Quasar. Próxima tentativa será importar o CSS diretamente em um arquivo JS/TS de entrada global.
  [2025-08-07 08:14:33] - Pergunta registrada: Como tornar os componentes do Ant Design Vue globais para evitar importação manual em cada página? Próxima etapa: sugerir registro global dos componentes no boot file.
  [2025-08-07 08:14:49] - Decisão: Registrar todos os componentes do Ant Design Vue globalmente para evitar importação manual em cada página.
  [2025-08-07 08:15:02] - Confirmação: Prosseguir com o registro global de todos os componentes do Ant Design Vue, mesmo com possível aumento do bundle.
  [2025-08-07 08:21:49] - Correção aplicada: O erro de renderização dos componentes do Ant Design Vue foi resolvido ao remover o import do CSS do boot file e garantir a importação global via app.scss. O plugin Antd deve ser registrado apenas no boot file.
  [2025-08-07 08:23:47] - Pinia incluído globalmente no projeto via boot file e configuração do Quasar.
  [2025-08-07 08:25:58] - Nova demanda: Criar telas de cadastro e login seguindo padrão enterprise, utilizando Ant Design Vue.
  [2025-08-07 09:09:33] - Padronização de cores: Definido tom azul (#1e40af, #1e3a8a, #1e293b) como paleta principal da marca AuthGuard Enterprise. Aplicado em todas as páginas para consistência visual.
  [2025-07-09 12:30:15] - **MAJOR DECISION**: Redesign completo da sidebar para padrão enterprise profissional.

## Rationale

- A sidebar anterior não atendia aos padrões de qualidade enterprise esperados
- Necessidade de melhor hierarquia visual e micro-interações
- Requisito de responsividade e acessibilidade aprimorados

## Implementation Details

### Sidebar Header
- **Logo com gradiente**: Implementado gradiente azul (#1e40af → #3b82f6) para maior impacto visual
- **Versão e idioma integrados**: Adicionado seletor de idioma e versão no header para fácil acesso
- **Tipografia aprimorada**: Fonte Inter Variable, pesos 700 para título, espaçamento otimizado

### Campo de Busca
- **Design limpo**: Border radius 8px, altura 40px, foco com box-shadow azul
- **Ícone de busca**: SearchOutlined integrado como prefix
- **Estados visuais**: Hover e focus bem definidos

### Menu Principal
- **Indicador visual lateral**: Barra azul de 3px que cresce no hover/selected
- **Micro-animações**: Transform translateX(4px) no hover, transições suaves
- **Hierarquia melhorada**: Título e subtítulo bem diferenciados
- **Espaçamento otimizado**: Margens e padding ajustados para melhor legibilidade

### Footer da Sidebar
- **Seção dedicada**: Área separada para ações do usuário
- **Gradiente sutil**: Background com gradiente para separação visual
- **Itens de menu**: Dark Mode e Logout como itens de menu padronizados

### Header Principal
- **Breadcrumb com subtítulos**: Título da página + descrição contextual
- **Sistema de notificações**: Badge com contador de notificações
- **Perfil de usuário aprimorado**: Avatar, nome e role do usuário
- **Dropdown melhorado**: Trigger click, melhor posicionamento

### Responsividade
- **Breakpoints otimizados**: 768px e 480px para mobile
- **Elementos condicionais**: Informações do usuário ocultadas em telas pequenas
- **Sidebar mobile**: Posição fixed em telas muito pequenas

### Micro-interações
- **Transições suaves**: cubic-bezier(0.4, 0, 0.2, 1) para todas as animações
- **Hover effects**: Background e cor consistentes
- **Loading states**: Preparado para estados de carregamento
- **Focus management**: Melhor navegação por teclado
