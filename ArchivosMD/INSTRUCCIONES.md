# 📋 Instrucciones de Ejecución

## 🐳 Ejecutar con Docker Compose (Recomendado)

### Primera vez / Reconstruir todo:
```bash
cd restaurant-backend
docker-compose up --build
```

### Ejecutar sin reconstruir:
```bash
docker-compose up
```

### Ejecutar en segundo plano:
```bash
docker-compose up -d
```

### Detener servicios:
```bash
docker-compose down
```

### Ver logs:
```bash
docker-compose logs -f [nombre-servicio]
# Ejemplo: docker-compose logs -f order-service
```

## 💻 Desarrollo Local (Sin Docker)

### 1. Instalar dependencias en cada servicio:
```bash
cd api-gateway && npm install
cd ../order-service && npm install
cd ../kitchen-service && npm install
cd ../notification-service && npm install
```

### 2. Iniciar servicios externos:
- **RabbitMQ**: `docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management`
- **MongoDB**: `docker run -d -p 27017:27017 mongo:latest`

### 3. Ejecutar cada servicio en terminales separadas:
```bash
# Terminal 1 - API Gateway
cd api-gateway
npm run dev

# Terminal 2 - Order Service
cd order-service
npm run dev

# Terminal 3 - Kitchen Service
cd kitchen-service
npm run dev

# Terminal 4 - Notification Service
cd notification-service
npm run dev
```

## 🔍 Verificar que todo funciona

1. **RabbitMQ Management**: http://localhost:15672 (guest/guest)
2. **API Gateway Health**: http://localhost:3000/health
3. **Order Service Health**: http://localhost:3001/health
4. **Kitchen Service Health**: http://localhost:3002/health

## 📝 Próximos Pasos

Una vez que la estructura esté lista, implementar:

1. **Conexiones a MongoDB** en order-service y kitchen-service
2. **Configuración de RabbitMQ** (publicar/consumir eventos)
3. **Lógica de negocio** en cada servicio
4. **Endpoints completos** en API Gateway
5. **Tests** para cada funcionalidad

## 🐛 Troubleshooting

### Error: Puerto ya en uso
- Cambiar el puerto en el archivo correspondiente o detener el proceso que lo usa

### Error: No se puede conectar a RabbitMQ/MongoDB
- Verificar que los servicios estén corriendo: `docker ps`
- Verificar las URLs de conexión en las variables de entorno

### Error: Módulos no encontrados
- Ejecutar `npm install` en cada servicio
- Verificar que `node_modules` existe

