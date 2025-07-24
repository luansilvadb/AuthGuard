# 🗄️ Guia de Migrações - AuthGuard

Este guia explica como configurar e usar o sistema de migrações do AuthGuard.

## 📋 **Configuração Atual**

### **Desenvolvimento (NODE_ENV=development)**
- ✅ **Sincronização Automática**: Ativada
- ✅ **Logging**: Ativado
- ✅ **Inicialização**: Automática no `main.ts`

### **Produção (NODE_ENV=production)**
- ❌ **Sincronização Automática**: Desativada
- ✅ **Migrações Manuais**: Necessárias
- ⚠️ **Logging**: Desativado

## 🚀 **Como Usar**

### **1. Desenvolvimento (Recomendado)**
```bash
# Inicialização completa (banco + seeds + servidor)
npm run dev:setup

# Ou passo a passo:
npm run db:init      # Inicializa banco
npm run seed:run     # Executa seeds
npm run start:dev    # Inicia servidor
```

### **2. Produção**
```bash
# Gerar migração
npm run migration:generate -- src/database/migrations/NomeDaMigracao

# Executar migrações
npm run migration:run

# Reverter última migração
npm run migration:revert
```

## 🔧 **Scripts Disponíveis**

| Comando | Descrição |
|---------|-----------|
| `npm run db:init` | Inicializa banco de dados |
| `npm run db:setup` | Inicializa banco + executa seeds |
| `npm run dev:setup` | Setup completo para desenvolvimento |
| `npm run migration:generate` | Gera nova migração |
| `npm run migration:run` | Executa migrações pendentes |
| `npm run migration:revert` | Reverte última migração |
| `npm run seed:run` | Executa seeds do banco |

## 📁 **Estrutura de Arquivos**

```
backend/
├── src/
│   ├── database/
│   │   ├── entities/          # Entidades do TypeORM
│   │   ├── migrations/        # Migrações (vazio por padrão)
│   │   └── seeds/            # Seeds do banco
│   └── config/
│       └── database.config.ts # Configuração do banco
├── init-database.ts          # Script de inicialização
└── package.json              # Scripts npm
```

## ⚠️ **Problemas Comuns**

### **1. Sincronização não funciona**
- ✅ Verifique se `NODE_ENV=development`
- ✅ Verifique conexão com banco
- ✅ Verifique credenciais no `.env`

### **2. Erro de conexão**
```bash
# Verifique se o PostgreSQL está rodando
# Verifique as credenciais no .env
# Teste a conexão manualmente
```

### **3. Tabelas não são criadas**
- ✅ Execute `npm run db:init`
- ✅ Verifique logs de erro
- ✅ Verifique permissões do usuário

## 🔄 **Fluxo de Desenvolvimento**

1. **Primeira vez:**
   ```bash
   npm run dev:setup
   ```

2. **Desenvolvimento diário:**
   ```bash
   npm run start:dev  # Sincronização automática
   ```

3. **Mudanças no modelo:**
   ```bash
   # Em desenvolvimento: automático
   # Em produção: npm run migration:generate
   ```

## 📝 **Logs Importantes**

- `🔄 Inicializando banco de dados...`
- `✅ Banco de dados inicializado com sucesso!`
- `🏗️  Sincronizando esquemas...`
- `✅ Esquemas sincronizados!`

## 🎯 **Recomendações**

1. **Desenvolvimento**: Use `synchronize: true`
2. **Produção**: Use migrações manuais
3. **Sempre**: Teste em ambiente de desenvolvimento primeiro
4. **Backup**: Faça backup antes de migrações em produção

## 🆘 **Suporte**

Se encontrar problemas:
1. Verifique os logs de erro
2. Confirme configurações do `.env`
3. Teste conexão manual com banco
4. Verifique se todas as dependências estão instaladas 