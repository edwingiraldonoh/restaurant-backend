# Script para iniciar servicios necesarios (MongoDB y RabbitMQ)
# Requiere Docker Desktop instalado

Write-Host "🚀 Iniciando servicios necesarios..." -ForegroundColor Green

# Verificar si Docker está disponible
try {
    docker --version | Out-Null
    Write-Host "✅ Docker encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "Por favor instala Docker Desktop desde: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# Verificar si los contenedores ya existen
$mongoExists = docker ps -a --filter "name=mongodb-restaurant" --format "{{.Names}}" 2>$null
$rabbitExists = docker ps -a --filter "name=rabbitmq-restaurant" --format "{{.Names}}" 2>$null

# Iniciar MongoDB
if ($mongoExists) {
    Write-Host "📦 MongoDB ya existe, iniciando..." -ForegroundColor Cyan
    docker start mongodb-restaurant 2>$null
} else {
    Write-Host "📦 Iniciando MongoDB..." -ForegroundColor Cyan
    docker run -d --name mongodb-restaurant -p 27017:27017 mongo:latest
}

# Iniciar RabbitMQ
if ($rabbitExists) {
    Write-Host "🐰 RabbitMQ ya existe, iniciando..." -ForegroundColor Cyan
    docker start rabbitmq-restaurant 2>$null
} else {
    Write-Host "🐰 Iniciando RabbitMQ..." -ForegroundColor Cyan
    docker run -d --name rabbitmq-restaurant -p 5672:5672 -p 15672:15672 `
        -e RABBITMQ_DEFAULT_USER=guest `
        -e RABBITMQ_DEFAULT_PASS=guest `
        rabbitmq:3-management
}

Write-Host ""
Write-Host "✅ Servicios iniciados!" -ForegroundColor Green
Write-Host "MongoDB: localhost:27017" -ForegroundColor Yellow
Write-Host "RabbitMQ: localhost:5672" -ForegroundColor Yellow
Write-Host "RabbitMQ Management: http://localhost:15672 (guest/guest)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Para detener los servicios:" -ForegroundColor Cyan
Write-Host "  npm run services:stop" -ForegroundColor White

