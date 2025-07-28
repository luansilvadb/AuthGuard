#!/bin/bash

echo "🔍 Testando deploy da AuthGuard API..."

# Configurações
API_URL="http://localhost:5000"
MAX_RETRIES=30
RETRY_INTERVAL=2

echo "📍 URL da API: $API_URL"
echo "⏳ Aguardando aplicação inicializar..."

# Aguardar a aplicação inicializar
for i in $(seq 1 $MAX_RETRIES); do
    echo "Tentativa $i/$MAX_RETRIES..."
    
    # Testar endpoint de ping
    if curl -s -f "$API_URL/ping" > /dev/null 2>&1; then
        echo "✅ Aplicação está respondendo!"
        break
    fi
    
    if [ $i -eq $MAX_RETRIES ]; then
        echo "❌ Aplicação não está respondendo após $MAX_RETRIES tentativas"
        exit 1
    fi
    
    sleep $RETRY_INTERVAL
done

echo ""
echo "🧪 Executando testes de saúde..."

# Testar health check básico
echo "📊 Health Check Básico:"
curl -s "$API_URL/health" | jq '.' 2>/dev/null || curl -s "$API_URL/health"

echo ""
echo "📊 Health Check Detalhado:"
curl -s "$API_URL/health/detailed" | jq '.' 2>/dev/null || curl -s "$API_URL/health/detailed"

echo ""
echo "📊 Health Check Completo:"
curl -s "$API_URL/" | jq '.' 2>/dev/null || curl -s "$API_URL/"

echo ""
echo "📚 Testando Swagger:"
if curl -s -f "$API_URL/swagger" > /dev/null 2>&1; then
    echo "✅ Swagger está disponível em: $API_URL/swagger"
else
    echo "⚠️  Swagger não está disponível"
fi

echo ""
echo "🎉 Testes concluídos!"
echo "📍 API está funcionando em: $API_URL"
echo "📚 Swagger: $API_URL/swagger" 