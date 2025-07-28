#!/bin/bash

echo "🔍 Testando AuthGuard API localmente..."

# Configurações
API_URL="http://localhost:5000"
MAX_RETRIES=10
RETRY_INTERVAL=3

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
        echo "💡 Verifique se a aplicação está rodando com: dotnet run"
        exit 1
    fi
    
    sleep $RETRY_INTERVAL
done

echo ""
echo "🧪 Executando testes..."

# Testar endpoint de teste
echo "📊 Teste da API:"
curl -s "$API_URL/test" | jq '.' 2>/dev/null || curl -s "$API_URL/test"

echo ""
echo "📊 Health Check:"
curl -s "$API_URL/health" | jq '.' 2>/dev/null || curl -s "$API_URL/health"

echo ""
echo "📊 Ping:"
curl -s "$API_URL/ping" | jq '.' 2>/dev/null || curl -s "$API_URL/ping"

echo ""
echo "📚 Testando Swagger:"
if curl -s -f "$API_URL/swagger" > /dev/null 2>&1; then
    echo "✅ Swagger está disponível em: $API_URL/swagger"
    echo "🌐 Abra no navegador: $API_URL/swagger"
else
    echo "⚠️  Swagger não está disponível"
fi

echo ""
echo "🎉 Testes concluídos!"
echo "📍 API está funcionando em: $API_URL"
echo "📚 Swagger: $API_URL/swagger"
echo "🧪 Teste: $API_URL/test" 