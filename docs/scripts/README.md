# 🛠️ Scripts e Ferramentas

Esta pasta contém scripts de automação e ferramentas úteis para o desenvolvimento e deploy do AuthGuard API.

## 📋 Scripts Disponíveis

### 🧪 **Scripts de Teste**

#### `test-local.sh`
Script para testar a aplicação localmente.

**Uso:**
```bash
./test-local.sh
```

**Funcionalidades:**
- ✅ Testa se a aplicação está respondendo
- ✅ Verifica endpoints de saúde
- ✅ Testa conectividade com banco
- ✅ Valida Swagger
- ✅ Executa health checks

#### `test-deployment.sh`
Script para testar o deploy em produção.

**Uso:**
```bash
./test-deployment.sh
```

**Funcionalidades:**
- ✅ Testa endpoints de produção
- ✅ Verifica conectividade
- ✅ Valida health checks
- ✅ Testa performance básica

### 🔧 **Como Usar os Scripts**

#### Pré-requisitos
- Bash ou PowerShell
- curl instalado
- Acesso à aplicação (local ou remota)

#### Execução
```bash
# Teste local
cd docs/scripts
./test-local.sh

# Teste de produção
./test-deployment.sh
```

#### Personalização
Você pode modificar as variáveis no início dos scripts:
```bash
# Configurações
API_URL="http://localhost:5000"  # URL da API
MAX_RETRIES=30                   # Tentativas máximas
RETRY_INTERVAL=2                 # Intervalo entre tentativas
```

## 📊 **Output dos Scripts**

### Teste Local
```
🔍 Testando AuthGuard API localmente...
📍 URL da API: http://localhost:5000
⏳ Aguardando aplicação inicializar...
✅ Aplicação está respondendo!

🧪 Executando testes...
📊 Teste da API: {"message":"AuthGuard API está funcionando!"}
📊 Health Check: {"status":"healthy","database":"connected"}
✅ Swagger está disponível em: http://localhost:5000/swagger
```

### Teste de Deploy
```
🔍 Testando deploy da AuthGuard API...
📍 URL da API: http://localhost:80
⏳ Aguardando aplicação inicializar...
✅ Aplicação está respondendo!

🧪 Executando testes de saúde...
📊 Health Check Básico: {"status":"healthy"}
📊 Health Check Detalhado: {"status":"healthy","environment":"Production"}
✅ Swagger está disponível em: http://localhost:80/swagger
```

## 🚨 **Códigos de Retorno**

- **0**: Sucesso - Todos os testes passaram
- **1**: Erro - Aplicação não está respondendo
- **2**: Erro - Banco de dados não conectado
- **3**: Erro - Swagger não disponível

## 🔧 **Troubleshooting dos Scripts**

### Problema: Script não executa
```bash
# Verificar permissões
chmod +x test-local.sh
chmod +x test-deployment.sh

# Executar com bash explicitamente
bash test-local.sh
```

### Problema: curl não encontrado
```bash
# Instalar curl (Ubuntu/Debian)
sudo apt-get install curl

# Instalar curl (Windows)
# Baixar de https://curl.se/windows/
```

### Problema: Timeout nos testes
```bash
# Aumentar timeout no script
RETRY_INTERVAL=5
MAX_RETRIES=60
```

## 📝 **Criando Novos Scripts**

### Template para Novo Script
```bash
#!/bin/bash

echo "🔍 Descrição do script..."

# Configurações
API_URL="http://localhost:5000"
MAX_RETRIES=30
RETRY_INTERVAL=2

# Função principal
main() {
    echo "📍 Executando..."
    
    # Seu código aqui
    
    echo "✅ Concluído!"
}

# Executar
main "$@"
```

### Boas Práticas
- ✅ Usar nomes descritivos
- ✅ Incluir comentários
- ✅ Tratar erros
- ✅ Usar códigos de retorno
- ✅ Documentar uso

## 📞 **Suporte**

Se encontrar problemas com os scripts:
1. Verifique se a aplicação está rodando
2. Confirme as configurações de URL
3. Teste manualmente com curl
4. Verifique os logs da aplicação

---

**Última atualização**: Julho 2025  
**Versão dos scripts**: 1.0.0 