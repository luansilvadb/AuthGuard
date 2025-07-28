# 📊 Configuração de Logs - AuthGuard API

## Visão Geral

O AuthGuard API utiliza o **Serilog** como framework de logging principal, oferecendo logs estruturados e configuráveis para diferentes ambientes.

## 🎯 Características

- **Logs Estruturados**: Formato JSON para fácil parsing e análise
- **Múltiplos Destinos**: Console, Arquivo e Debug
- **Enriquecimento**: MachineName, ThreadId, Timestamp
- **Rolling Files**: Rotação automática de arquivos de log
- **Níveis Configuráveis**: Diferentes níveis por ambiente
- **Middleware Personalizado**: Logging de requisições HTTP

## 📁 Estrutura de Arquivos

```
logs/
├── authguard-YYYY-MM-DD.txt          # Logs de produção
├── authguard-dev-YYYY-MM-DD.txt      # Logs de desenvolvimento
└── authguard-prod-YYYY-MM-DD.txt     # Logs de produção (alternativo)
```

## ⚙️ Configurações por Ambiente

### Desenvolvimento (`appsettings.Development.json`)
- **Nível**: Debug
- **Retenção**: 7 dias
- **Tamanho Máximo**: 10MB por arquivo
- **Logs Detalhados**: Entity Framework, Hangfire, HTTP

### Produção (`appsettings.Production.json`)
- **Nível**: Warning
- **Retenção**: 30 dias
- **Tamanho Máximo**: 50MB por arquivo
- **Logs Otimizados**: Apenas warnings e erros

## 🔧 Configuração do Middleware

O `RequestLoggingMiddleware` registra automaticamente:
- ✅ Requisições HTTP (método, path, IP)
- ✅ Tempo de resposta
- ✅ Códigos de status
- ✅ User-Agent
- ✅ Tratamento de erros

## 📝 Formatos de Log

### Console
```
[14:39:13 INF] 🚀 Iniciando AuthGuard API...
[14:39:13 INF] 📥 GET https://localhost:7094/api/tenants iniciado por 127.0.0.1
[14:39:13 INF] 📤 GET https://localhost:7094/api/tenants concluído com status 200 em 45ms
```

### Arquivo
```
2024-01-15 14:39:13.123 -03:00 [INF] DESKTOP-ABC123 [1] 🚀 Iniciando AuthGuard API...
2024-01-15 14:39:13.456 -03:00 [INF] DESKTOP-ABC123 [5] 📥 GET https://localhost:7094/api/tenants iniciado por 127.0.0.1
```

## 🚀 Como Usar

### Logging Básico
```csharp
_logger.LogInformation("Operação realizada com sucesso");
_logger.LogWarning("Atenção: dados incompletos");
_logger.LogError(exception, "Erro durante operação");
```

### Logging Estruturado
```csharp
_logger.LogInformation("Usuário {UserId} acessou {Resource}", userId, resourceName);
```

### Logging de Performance
```csharp
using var scope = _logger.BeginScope("Operação: {Operation}", operationName);
var stopwatch = Stopwatch.StartNew();
// ... código ...
_logger.LogInformation("Operação {Operation} concluída em {Duration}ms", operationName, stopwatch.ElapsedMilliseconds);
```

## 🔍 Monitoramento

### Logs Importantes para Monitorar
- **Erros 5xx**: Problemas de servidor
- **Warnings 4xx**: Problemas de cliente
- **Tempo de Resposta**: Performance da API
- **Entity Framework**: Queries lentas
- **Hangfire**: Jobs em falha

### Comandos Úteis
```bash
# Ver logs em tempo real
tail -f logs/authguard-$(date +%Y-%m-%d).txt

# Buscar erros
grep "ERR" logs/authguard-*.txt

# Buscar requisições lentas (>1s)
grep "ms" logs/authguard-*.txt | awk '$NF > 1000'
```

## 🛠️ Troubleshooting

### Problema: Logs muito verbosos
**Solução**: Ajustar níveis no `appsettings.json`
```json
"Override": {
  "Microsoft.EntityFrameworkCore": "Warning"
}
```

### Problema: Arquivos de log muito grandes
**Solução**: Reduzir `retainedFileCountLimit` ou `fileSizeLimitBytes`

### Problema: Performance impactada
**Solução**: Usar configuração de produção ou reduzir níveis de log

## 📚 Referências

- [Serilog Documentation](https://serilog.net/)
- [ASP.NET Core Logging](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/logging/)
- [Structured Logging](https://serilog.net/structured-logging-concepts/) 