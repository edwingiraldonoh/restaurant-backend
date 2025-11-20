# Script para detener servicios

Write-Host "🛑 Deteniendo servicios..." -ForegroundColor Yellow

docker stop mongodb-restaurant rabbitmq-restaurant 2>$null
docker rm mongodb-restaurant rabbitmq-restaurant 2>$null

Write-Host "✅ Servicios detenidos" -ForegroundColor Green

