# Decision Log

This file records architectural and implementation decisions using a list format.
2025-07-08 06:18:16 - Log of updates made.

*

## Decision

* Inicialização do Memory Bank para rastreamento de contexto e decisões do projeto.

## Rationale 

* Facilitar a documentação contínua e a rastreabilidade das decisões arquiteturais.

## Implementation Details

* Criação dos arquivos productContext.md, activeContext.md e progress.md como parte da inicialização.
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