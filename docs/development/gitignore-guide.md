# 🔒 Guia do .gitignore - AuthGuard API

Este documento explica as configurações do `.gitignore` do projeto AuthGuard API e as decisões tomadas para proteger dados sensíveis e manter o repositório limpo.

## 🎯 **Objetivo**

O `.gitignore` tem como objetivo:
- 🔒 **Proteger dados sensíveis** (senhas, chaves, configurações)
- 🧹 **Manter o repositório limpo** (arquivos temporários, builds)
- 🚀 **Facilitar o desenvolvimento** (ignorar arquivos desnecessários)
- 📦 **Otimizar o versionamento** (focar apenas no código fonte)

## 📁 **Estrutura Organizada**

O `.gitignore` está organizado em seções lógicas:

### 🔧 **.NET Build Results**
```
[Dd]ebug/
[Rr]elease/
[Bb]in/
[Oo]bj/
[Ll]ogs/
```
**Por que ignorar?** Arquivos gerados automaticamente pelo compilador.

### 🖥️ **IDE e Editores**
```
.vs/
.vscode/
.idea/
*.user
*.suo
```
**Por que ignorar?** Configurações específicas do desenvolvedor.

### 🧪 **Testes e Cobertura**
```
[Tt]est[Rr]esult*/
coverage*.json
*.coverage
```
**Por que ignorar?** Resultados de testes que mudam a cada execução.

### 🔐 **Configurações Sensíveis**
```
.env
appsettings.Production.json
*.pfx
secrets.json
```
**Por que ignorar?** Contêm senhas, chaves e dados sensíveis.

### 🗄️ **Banco de Dados**
```
*.mdf
*.ldf
*.db
*.sqlite
```
**Por que ignorar?** Arquivos de dados que podem ser recriados.

### 📝 **Logs e Monitoramento**
```
logs/
*.log
*.tlog
```
**Por que ignorar?** Arquivos temporários que mudam constantemente.

## 🔒 **Segurança - Arquivos Protegidos**

### ⚠️ **Nunca Commitar**
- **Arquivos `.env`**: Variáveis de ambiente com senhas
- **`appsettings.Production.json`**: Configurações de produção
- **Certificados `*.pfx`**: Chaves de segurança
- **`secrets.json`**: Segredos da aplicação
- **Logs**: Podem conter informações sensíveis

### ✅ **Sempre Commitar**
- **`appsettings.json`**: Configuração base (sem senhas)
- **`Dockerfile`**: Configuração de container
- **`docker-compose.yml`**: Orquestração de containers
- **Código fonte**: `.cs`, `.csproj`, etc.

## 🛠️ **Configurações Específicas do AuthGuard**

### 📁 **Logs da Aplicação**
```
AuthGuard.API/logs/
AuthGuard.Application/logs/
AuthGuard.Infrastructure/logs/
```
**Motivo**: Logs específicos de cada projeto.

### 🗄️ **Migrações**
```
**/Migrations/*.Designer.cs
```
**Motivo**: Arquivos gerados automaticamente pelo Entity Framework.

### 🔄 **Backups**
```
*.backup
*.bak
Backup*/
```
**Motivo**: Arquivos de backup que podem ser recriados.

## 🐳 **Docker e Containerização**

### ✅ **Manter no Versionamento**
- `Dockerfile`
- `docker-compose.yml`
- `.dockerignore`

### ❌ **Ignorar**
- `docker-compose.override.yml` (configurações locais)
- Imagens Docker geradas
- Containers em execução

## 🔧 **Como Usar**

### 📋 **Verificar Arquivos Ignorados**
```bash
# Ver quais arquivos estão sendo ignorados
git status --ignored

# Verificar se um arquivo específico está sendo ignorado
git check-ignore nome-do-arquivo
```

### 🔍 **Adicionar Arquivo Ignorado Temporariamente**
```bash
# Forçar adição de arquivo ignorado (use com cuidado!)
git add -f arquivo-ignorado.txt
```

### 📝 **Criar Arquivo de Exemplo**
```bash
# Para configurações sensíveis, crie arquivos de exemplo
cp appsettings.json appsettings.Example.json
# Remova dados sensíveis do arquivo de exemplo
```

## 🚨 **Problemas Comuns**

### ❌ **Arquivo Sensível Commitado**
```bash
# Remover arquivo do histórico (use com cuidado!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch arquivo-sensivel.json" \
  --prune-empty --tag-name-filter cat -- --all
```

### 🔄 **Arquivo Não Está Sendo Ignorado**
1. Verifique se o arquivo já foi commitado
2. Se sim, remova do cache: `git rm --cached arquivo`
3. Se não, verifique a sintaxe do `.gitignore`

### 📁 **Pasta Não Está Sendo Ignorada**
```bash
# Verificar se a pasta tem arquivos
ls -la pasta/

# Se estiver vazia, adicione um .gitkeep
touch pasta/.gitkeep
```

## 📋 **Checklist de Segurança**

- [ ] Nenhum arquivo `.env` no repositório
- [ ] Nenhum `appsettings.Production.json` no repositório
- [ ] Nenhum certificado `*.pfx` no repositório
- [ ] Nenhum arquivo `secrets.json` no repositório
- [ ] Logs não estão sendo commitados
- [ ] Arquivos de banco não estão sendo commitados
- [ ] Arquivos temporários não estão sendo commitados

## 🔄 **Manutenção**

### 📅 **Revisão Periódica**
- Revisar mensalmente se há novos tipos de arquivo para ignorar
- Verificar se há arquivos sensíveis sendo commitados
- Atualizar para novas versões do .NET se necessário

### 📝 **Adicionar Novas Regras**
1. Identificar o tipo de arquivo
2. Escolher a seção apropriada
3. Adicionar com comentário explicativo
4. Testar se está funcionando
5. Documentar aqui

## 📞 **Suporte**

Se encontrar problemas com o `.gitignore`:
1. Verifique a sintaxe das regras
2. Confirme se o arquivo já foi commitado
3. Use `git check-ignore` para debug
4. Consulte a documentação do Git

---

**Última atualização**: Julho 2025  
**Versão do .gitignore**: 2.0.0 