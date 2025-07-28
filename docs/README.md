# 📚 Documentação AuthGuard API

Bem-vindo à documentação completa do **AuthGuard API** - Sistema Multitenant B2B para ecossistema SaaS.

## 🎯 Visão Geral

O AuthGuard é um sistema completo de gestão multitenant desenvolvido em **.NET 8** com **PostgreSQL**, seguindo os princípios da **Clean Architecture** e **CQRS Pattern**.

### ✨ Características Principais

- 🏢 **Multitenant**: Suporte completo a múltiplos tenants
- 🔐 **Autenticação JWT**: Sistema seguro de autenticação
- 👥 **Gestão de Usuários**: Hierarquia de permissões
- 📊 **Dashboard Executivo**: Métricas e relatórios
- 🚀 **Deploy Automatizado**: Docker e CI/CD
- 📝 **Logs Estruturados**: Serilog para monitoramento

## 📋 Índice da Documentação

### 🚀 **Primeiros Passos**
- **[Instalação e Configuração](./getting-started/installation.md)** - Como configurar o ambiente
- **[Configuração do Banco](./getting-started/database-setup.md)** - Setup do PostgreSQL
- **[Primeira Execução](./getting-started/first-run.md)** - Rodando pela primeira vez

### 🏗️ **Arquitetura**
- **[Visão Geral da Arquitetura](./architecture/overview.md)** - Princípios e estrutura
- **[Clean Architecture](./architecture/clean-architecture.md)** - Implementação da Clean Architecture
- **[Estrutura Organizada](./architecture/organized-structure.md)** - Organização do código
- **[Padrões Utilizados](./architecture/patterns.md)** - CQRS, Repository, etc.

### 🔧 **Desenvolvimento**
- **[Guia de Desenvolvimento](./development/guide.md)** - Como contribuir
- **[Padrões de Código](./development/coding-standards.md)** - Convenções e boas práticas
- **[Testes](./development/testing.md)** - Estratégias de teste
- **[Debugging](./development/debugging.md)** - Como debugar a aplicação

### 🚀 **Deploy e Produção**
- **[Guia de Deploy](./deployment/guide.md)** - Deploy em produção
- **[Docker](./deployment/docker.md)** - Containerização
- **[Monitoramento](./deployment/monitoring.md)** - Logs e métricas
- **[Backup e Recuperação](./deployment/backup.md)** - Estratégias de backup

### 🔍 **Troubleshooting**
- **[Problemas Comuns](./troubleshooting/common-issues.md)** - Soluções para problemas frequentes
- **[Logs e Diagnóstico](./troubleshooting/logs.md)** - Como interpretar logs
- **[Performance](./troubleshooting/performance.md)** - Otimizações e problemas de performance

### 📖 **Referência da API**
- **[Endpoints](./api-reference/endpoints.md)** - Documentação dos endpoints
- **[Autenticação](./api-reference/authentication.md)** - Como autenticar
- **[Modelos de Dados](./api-reference/data-models.md)** - Estruturas de dados
- **[Códigos de Erro](./api-reference/error-codes.md)** - Códigos de status e erro

### 🛠️ **Ferramentas e Scripts**
- **[Scripts de Teste](./scripts/README.md)** - Scripts de automação
- **[Utilitários](./scripts/utilities.md)** - Ferramentas auxiliares

## 🎯 **Como Usar Esta Documentação**

### 👨‍💻 **Para Desenvolvedores**
1. Comece com **[Instalação e Configuração](./getting-started/installation.md)**
2. Leia **[Visão Geral da Arquitetura](./architecture/overview.md)**
3. Siga o **[Guia de Desenvolvimento](./development/guide.md)**
4. Consulte **[Troubleshooting](./troubleshooting/common-issues.md)** se encontrar problemas

### 🚀 **Para DevOps/Deploy**
1. Siga **[Guia de Deploy](./deployment/guide.md)**
2. Configure **[Docker](./deployment/docker.md)**
3. Implemente **[Monitoramento](./deployment/monitoring.md)**
4. Configure **[Backup](./deployment/backup.md)**

### 📖 **Para Usuários da API**
1. Leia **[Autenticação](./api-reference/authentication.md)**
2. Consulte **[Endpoints](./api-reference/endpoints.md)**
3. Entenda **[Modelos de Dados](./api-reference/data-models.md)**

## 📁 **Estrutura da Documentação**

```
docs/
├── README.md                     # Este arquivo - Índice principal
├── getting-started/              # 🚀 Primeiros passos
│   ├── installation.md
│   ├── database-setup.md
│   └── first-run.md
├── architecture/                 # 🏗️ Arquitetura
│   ├── overview.md
│   ├── clean-architecture.md
│   ├── organized-structure.md
│   └── patterns.md
├── development/                  # 🔧 Desenvolvimento
│   ├── guide.md
│   ├── coding-standards.md
│   ├── testing.md
│   └── debugging.md
├── deployment/                   # 🚀 Deploy e produção
│   ├── guide.md
│   ├── docker.md
│   ├── monitoring.md
│   └── backup.md
├── troubleshooting/              # 🔍 Solução de problemas
│   ├── common-issues.md
│   ├── logs.md
│   └── performance.md
├── api-reference/                # 📖 Referência da API
│   ├── endpoints.md
│   ├── authentication.md
│   ├── data-models.md
│   └── error-codes.md
└── scripts/                      # 🛠️ Scripts e ferramentas
    ├── README.md
    └── utilities.md
```

## 🔄 **Atualizações**

Esta documentação é atualizada regularmente:
- 📅 **Versões**: Acompanha as releases do projeto
- 🐛 **Correções**: Problemas identificados e resolvidos
- ✨ **Novas Funcionalidades**: Documentação de features
- 🔧 **Melhorias**: Otimizações e refatorações

## 📞 **Suporte e Contribuição**

### 🤝 **Como Contribuir**
1. Leia **[Guia de Desenvolvimento](./development/guide.md)**
2. Siga os **[Padrões de Código](./development/coding-standards.md)**
3. Documente suas mudanças
4. Teste suas alterações

### 🆘 **Precisa de Ajuda?**
1. Consulte **[Troubleshooting](./troubleshooting/common-issues.md)**
2. Verifique os **[Logs](./troubleshooting/logs.md)**
3. Teste com os **[Scripts](./scripts/README.md)**
4. Abra uma issue no repositório

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

---

**Última atualização**: Julho 2025  
**Versão da documentação**: 1.0.0  
**Versão da API**: 1.0.0 