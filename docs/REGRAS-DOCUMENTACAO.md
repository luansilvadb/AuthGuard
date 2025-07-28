# 📋 Regras de Documentação - AuthGuard API

## 🎯 **Regra Principal**

**SEMPRE criar arquivos de documentação `.md` na pasta `/docs` seguindo a estrutura organizada**

## 📁 **Estrutura Organizada da Documentação**

```
docs/
├── README.md                     # Índice principal da documentação
├── REGRAS-DOCUMENTACAO.md        # Este arquivo - Regras e padrões
├── getting-started/              # 🚀 Primeiros passos
│   ├── installation.md           # Instalação e configuração
│   ├── database-setup.md         # Setup do banco de dados
│   └── first-run.md              # Primeira execução
├── architecture/                 # 🏗️ Arquitetura
│   ├── overview.md               # Visão geral da arquitetura
│   ├── clean-architecture.md     # Clean Architecture
│   ├── organized-structure.md    # Estrutura organizada
│   └── patterns.md               # Padrões utilizados
├── development/                  # 🔧 Desenvolvimento
│   ├── guide.md                  # Guia de desenvolvimento
│   ├── coding-standards.md       # Padrões de código
│   ├── testing.md                # Estratégias de teste
│   └── debugging.md              # Como debugar
├── deployment/                   # 🚀 Deploy e produção
│   ├── guide.md                  # Guia de deploy
│   ├── docker.md                 # Containerização
│   ├── monitoring.md             # Monitoramento
│   └── backup.md                 # Backup e recuperação
├── troubleshooting/              # 🔍 Solução de problemas
│   ├── common-issues.md          # Problemas comuns
│   ├── logs.md                   # Logs e diagnóstico
│   └── performance.md            # Performance
├── api-reference/                # 📖 Referência da API
│   ├── endpoints.md              # Documentação dos endpoints
│   ├── authentication.md         # Autenticação
│   ├── data-models.md            # Modelos de dados
│   └── error-codes.md            # Códigos de erro
└── scripts/                      # 🛠️ Scripts e ferramentas
    ├── README.md                 # Documentação dos scripts
    └── utilities.md              # Utilitários
```

## 🎯 **Diretrizes por Categoria**

### 🚀 **Getting Started** (`/getting-started/`)
- **Objetivo**: Ajudar novos usuários a começar
- **Conteúdo**: Instalação, configuração inicial, primeira execução
- **Tom**: Tutorial, passo a passo, amigável
- **Exemplos**: Comandos, screenshots, configurações

### 🏗️ **Architecture** (`/architecture/`)
- **Objetivo**: Explicar a arquitetura e design do sistema
- **Conteúdo**: Princípios, padrões, estrutura, decisões técnicas
- **Tom**: Técnico, detalhado, explicativo
- **Exemplos**: Diagramas, fluxos, exemplos de código

### 🔧 **Development** (`/development/`)
- **Objetivo**: Guiar desenvolvedores no desenvolvimento
- **Conteúdo**: Padrões, convenções, testes, debugging
- **Tom**: Prático, orientado a ação
- **Exemplos**: Código, comandos, workflows

### 🚀 **Deployment** (`/deployment/`)
- **Objetivo**: Guiar deploy e operação em produção
- **Conteúdo**: Deploy, Docker, monitoramento, backup
- **Tom**: Operacional, passo a passo
- **Exemplos**: Scripts, configurações, comandos

### 🔍 **Troubleshooting** (`/troubleshooting/`)
- **Objetivo**: Resolver problemas e questões
- **Conteúdo**: Problemas comuns, soluções, diagnóstico
- **Tom**: Direto, focado em solução
- **Exemplos**: Logs, comandos de diagnóstico

### 📖 **API Reference** (`/api-reference/`)
- **Objetivo**: Documentação técnica da API
- **Conteúdo**: Endpoints, autenticação, modelos, erros
- **Tom**: Técnico, preciso, completo
- **Exemplos**: Requests, responses, códigos

### 🛠️ **Scripts** (`/scripts/`)
- **Objetivo**: Ferramentas e automação
- **Conteúdo**: Scripts, utilitários, automação
- **Tom**: Prático, funcional
- **Exemplos**: Uso, configuração, troubleshooting

## 📝 **Padrões de Nomenclatura**

### Arquivos de Documentação
- Use **kebab-case** para nomes de arquivos
- Use nomes **descritivos** e **específicos**
- Inclua **categoria** no nome quando relevante

**Exemplos:**
- ✅ `installation.md`
- ✅ `database-setup.md`
- ✅ `clean-architecture.md`
- ✅ `common-issues.md`
- ❌ `doc1.md`
- ❌ `setup.md` (muito genérico)

### Scripts
- Use **kebab-case** para nomes de scripts
- Inclua **ação** e **contexto** no nome

**Exemplos:**
- ✅ `test-local.sh`
- ✅ `test-deployment.sh`
- ✅ `setup-environment.sh`
- ✅ `backup-database.sh`

## 🎨 **Formatação Padrão**

### Estrutura de um arquivo .md
```markdown
# 🎯 Título Principal

## 📋 Descrição

## 🚀 Como Usar

## 🔧 Configuração

## 📁 Estrutura

## ✅ Benefícios

## 📞 Suporte

---

**Última atualização**: [Data]  
**Versão**: [Versão]
```

### Emojis Padrão por Categoria
- 🎯 - Objetivo principal
- 📋 - Listas e índices
- 🚀 - Deploy e execução
- 🔧 - Configuração e setup
- 📁 - Estrutura e organização
- ✅ - Benefícios e vantagens
- 📞 - Suporte e contato
- 🏗️ - Arquitetura
- 🐛 - Bugs e problemas
- 🔄 - Processos e fluxos
- 🧪 - Testes
- 📊 - Métricas e monitoramento
- 🔐 - Segurança e autenticação

## 🔄 **Processo de Criação de Documentação**

1. **Identificar categoria** - Em qual pasta o arquivo deve ir
2. **Escolher nome** - Seguir padrões de nomenclatura
3. **Criar arquivo** - Na pasta correta
4. **Aplicar formatação** - Usar estrutura padrão
5. **Atualizar índices** - README.md da categoria e principal
6. **Revisar conteúdo** - Verificar clareza e completude
7. **Testar links** - Confirmar que todos funcionam

## 📋 **Checklist para Nova Documentação**

- [ ] Arquivo criado na pasta correta (`/docs/[categoria]/`)
- [ ] Nome descritivo e consistente (kebab-case)
- [ ] Formatação padrão aplicada
- [ ] Emojis apropriados utilizados
- [ ] Links atualizados no README.md da categoria
- [ ] Links atualizados no README.md principal
- [ ] Conteúdo revisado e testado
- [ ] Scripts funcionando (se aplicável)
- [ ] Exemplos incluídos (quando relevante)

## 🎯 **Lembrete Importante**

**SEMPRE criar documentação `.md` na pasta `/docs` seguindo a estrutura organizada para manter a organização profissional do projeto!**

## 📞 **Suporte**

Se tiver dúvidas sobre onde colocar um arquivo ou como estruturar:
1. Consulte esta documentação
2. Verifique exemplos existentes
3. Siga os padrões estabelecidos
4. Mantenha consistência com a estrutura atual 