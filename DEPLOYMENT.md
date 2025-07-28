# 🚀 Guia de Deploy - AuthGuard API

## 📋 Pré-requisitos

- Docker instalado
- Acesso ao banco de dados PostgreSQL
- Porta 80 disponível

## 🔧 Deploy com Docker

### 1. Build da Imagem

```bash
docker build -t authguard-api .
```

### 2. Executar Container

```bash
docker run -d \
  --name authguard-api \
  -p 80:80 \
  -e ASPNETCORE_ENVIRONMENT=Production \
  -e ConnectionStrings__DefaultConnection="Host=vps.luansilva.com.br;Database=authguard;Username=postgres;Password=72b09a20c609e6baa62d;Pooling=true;MinPoolSize=1;MaxPoolSize=20;ConnectionIdleLifetime=300;ConnectionPruningInterval=10" \
  authguard-api
```

### 3. Verificar Logs

```bash
docker logs authguard-api
```

## 🧪 Testes de Saúde

### Endpoints Disponíveis

- **Health Check Básico**: `GET /health`
- **Health Check Detalhado**: `GET /health/detailed`
- **Health Check Completo**: `GET /`
- **Ping**: `GET /ping`
- **Swagger**: `GET /swagger`

### Teste Rápido

```bash
# Testar se a aplicação está respondendo
curl http://localhost:80/ping

# Verificar saúde da aplicação
curl http://localhost:80/health

# Acessar Swagger
curl http://localhost:80/swagger
```

## 🔍 Troubleshooting

### Problema: Aplicação não responde

1. **Verificar se o container está rodando**:
   ```bash
   docker ps
   ```

2. **Verificar logs do container**:
   ```bash
   docker logs authguard-api
   ```

3. **Verificar conectividade com banco**:
   ```bash
   curl http://localhost:80/health/detailed
   ```

### Problema: Erro de conexão com banco

1. **Verificar string de conexão**:
   - Confirme se o host `vps.luansilva.com.br` está acessível
   - Verifique se as credenciais estão corretas
   - Teste a conexão diretamente com o PostgreSQL

2. **Verificar firewall**:
   - Certifique-se de que a porta 5432 está liberada

### Problema: Aplicação para de funcionar

1. **Verificar uso de memória**:
   ```bash
   docker stats authguard-api
   ```

2. **Reiniciar container**:
   ```bash
   docker restart authguard-api
   ```

3. **Verificar logs de erro**:
   ```bash
   docker logs authguard-api --tail 100
   ```

## 📊 Monitoramento

### Logs Importantes

- **Inicialização**: Procure por "🚀 Iniciando AuthGuard API..."
- **Banco de dados**: Procure por "✅ Migrações do banco de dados aplicadas"
- **Erros**: Procure por "❌" nos logs

### Métricas de Saúde

- **Latência**: Deve ser < 1000ms
- **Status do banco**: Deve ser "connected"
- **Uptime**: Verificar se a aplicação está rodando continuamente

## 🔄 Atualizações

### Deploy de Nova Versão

1. **Parar container atual**:
   ```bash
   docker stop authguard-api
   docker rm authguard-api
   ```

2. **Build nova imagem**:
   ```bash
   docker build -t authguard-api .
   ```

3. **Executar nova versão**:
   ```bash
   docker run -d \
     --name authguard-api \
     -p 80:80 \
     -e ASPNETCORE_ENVIRONMENT=Production \
     -e ConnectionStrings__DefaultConnection="Host=vps.luansilva.com.br;Database=authguard;Username=postgres;Password=72b09a20c609e6baa62d;Pooling=true;MinPoolSize=1;MaxPoolSize=20;ConnectionIdleLifetime=300;ConnectionPruningInterval=10" \
     authguard-api
   ```

## 📞 Suporte

Se os problemas persistirem:

1. Verifique os logs completos
2. Teste a conectividade com o banco
3. Verifique se todas as variáveis de ambiente estão configuradas
4. Confirme se a porta 80 está disponível e não bloqueada 