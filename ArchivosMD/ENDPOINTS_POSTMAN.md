# 📡 Endpoints para Postman - Sistema de Restaurante

## 🏗️ Arquitectura del Sistema

```
Cliente → Frontend (5173) → API Gateway (3000) → Order Service (3001)
                                              ↓
                                    RabbitMQ → Kitchen Service (3002)
                                              ↓
                                    RabbitMQ → Notification Service (3003)
```

**Flujo de Eventos:**
1. Order Service publica `order.created` → RabbitMQ
2. Kitchen Service consume `order.created` → Guarda en MongoDB
3. Kitchen Service publica `order.ready` → RabbitMQ
4. Notification Service consume `order.created` y `order.ready` → Notifica

---

## 🚪 API Gateway (Puerto 3000)
**Punto de entrada único - Todos los requests del frontend pasan por aquí**

### Health Check
```
GET http://localhost:3000/health
```

### Crear Pedido (Cliente)
```
POST http://localhost:3000/orders
Content-Type: application/json

Body:
{
  "customerName": "Juan Pérez",
  "customerEmail": "juan@example.com",
  "items": [
    {
      "name": "Pizza Margherita",
      "quantity": 2,
      "price": 15.99
    },
    {
      "name": "Coca Cola",
      "quantity": 1,
      "price": 2.50
    }
  ]
}

Response:
{
  "success": true,
  "message": "Pedido creado exitosamente",
  "data": {
    "order": {
      "id": "507f1f77bcf86cd799439011",
      "orderNumber": "ORD-1234567890-001",
      "customerName": "Juan Pérez",
      "items": [...],
      "total": 34.48,
      "status": "pending",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  }
}
```

**Flujo:**
- API Gateway → Order Service (3001)
- Order Service guarda en MongoDB
- Order Service publica `order.created` a RabbitMQ
- Kitchen Service consume y guarda en su MongoDB
- Notification Service consume y notifica

### Consultar Estado de Pedido (Cliente)
```
GET http://localhost:3000/orders/:id

Ejemplo:
GET http://localhost:3000/orders/507f1f77bcf86cd799439011

Response:
{
  "success": true,
  "data": {
    "order": {
      "id": "507f1f77bcf86cd799439011",
      "orderNumber": "ORD-1234567890-001",
      "status": "pending",  // pending | preparing | ready
      "items": [...],
      "total": 34.48
    }
  }
}
```

**Flujo:**
- API Gateway → Order Service (3001)
- Order Service consulta MongoDB y devuelve estado

### Vista de Cocina (Interno/Administrativo)
```
GET http://localhost:3000/kitchen/orders

Query Parameters (opcional):
- status: "RECEIVED" | "PREPARING" | "READY"

Ejemplo:
GET http://localhost:3000/kitchen/orders?status=RECEIVED
```

**Flujo:**
- API Gateway → Kitchen Service (3002)
- Kitchen Service consulta su MongoDB (kitchen_orders)

---

## 📋 Order Service (Puerto 3001)
**Servicio interno - Normalmente se accede a través del API Gateway**

### Health Check
```
GET http://localhost:3001/health
```

### Crear Pedido (Interno - usado por API Gateway)
```
POST http://localhost:3001/orders
Content-Type: application/json

Body:
{
  "customerName": "María García",
  "customerEmail": "maria@example.com",  // Opcional
  "items": [
    {
      "name": "Hamburguesa",
      "quantity": 1,
      "price": 12.99
    }
  ]
}

Acciones:
1. Guarda order en MongoDB (colección: orders)
2. Publica evento "order.created" a RabbitMQ
```

### Obtener Todos los Pedidos (Interno)
```
GET http://localhost:3001/orders

Query Parameters (opcionales):
- limit: número (default: 50)
- skip: número (default: 0)

Ejemplo:
GET http://localhost:3001/orders?limit=10&skip=0
```

### Obtener Pedido por ID (Interno - usado por API Gateway)
```
GET http://localhost:3001/orders/:id

Ejemplo:
GET http://localhost:3001/orders/507f1f77bcf86cd799439011
```

### Consultar Estado de Pedido (Interno)
```
GET http://localhost:3001/orders/:id/status

Ejemplo:
GET http://localhost:3001/orders/507f1f77bcf86cd799439011/status

Response:
{
  "orderNumber": "ORD-1234567890-001",
  "status": "pending"  // pending | preparing | ready
}
```

**Nota:** Este servicio consume `order.ready` de RabbitMQ y actualiza el estado del pedido a "ready" cuando Kitchen Service lo marca como listo.

---

## 👨‍🍳 Kitchen Service (Puerto 3002)
**Servicio interno - Consume eventos de RabbitMQ y gestiona pedidos en cocina**

### Health Check
```
GET http://localhost:3002/health
```

### Flujo Automático (RabbitMQ)
**Este servicio NO recibe requests directos del frontend.**
- Consume `order.created` de RabbitMQ automáticamente
- Cuando recibe un evento, guarda en MongoDB (colección: kitchen_orders)
- Publica `order.created` a RabbitMQ para Notification Service

### Obtener Todos los Pedidos en Cocina (Interno - usado por API Gateway)
```
GET http://localhost:3002/api/kitchen/orders

Query Parameters (opcional):
- status: "RECEIVED" | "PREPARING" | "READY"

Ejemplos:
GET http://localhost:3002/api/kitchen/orders
GET http://localhost:3002/api/kitchen/orders?status=RECEIVED
GET http://localhost:3002/api/kitchen/orders?status=PREPARING
GET http://localhost:3002/api/kitchen/orders?status=READY
```

### Obtener Pedido Específico en Cocina (Interno)
```
GET http://localhost:3002/api/kitchen/orders/:orderId

Ejemplo:
GET http://localhost:3002/api/kitchen/orders/507f1f77bcf86cd799439011
```

### Iniciar Preparación de Pedido (Manual - Vista Cocina)
```
POST http://localhost:3002/api/kitchen/orders/:orderId/start-preparing

Ejemplo:
POST http://localhost:3002/api/kitchen/orders/507f1f77bcf86cd799439011/start-preparing

Acciones:
1. Actualiza status a "PREPARING" en MongoDB
2. Publica evento "order.preparing" a RabbitMQ

Response:
{
  "success": true,
  "message": "Order 507f1f77bcf86cd799439011 is now being prepared",
  "data": {
    "orderId": "507f1f77bcf86cd799439011",
    "status": "PREPARING",
    "preparingAt": "2024-01-15T10:30:00.000Z",
    "estimatedTime": 15,
    "items": [...]
  }
}
```

### Marcar Pedido como Listo (Manual - Vista Cocina)
```
POST http://localhost:3002/api/kitchen/orders/:orderId/ready

Ejemplo:
POST http://localhost:3002/api/kitchen/orders/507f1f77bcf86cd799439011/ready

Acciones:
1. Actualiza status a "READY" en MongoDB
2. Publica evento "order.ready" a RabbitMQ
3. Order Service consume "order.ready" y actualiza su estado

Response:
{
  "success": true,
  "message": "Order 507f1f77bcf86cd799439011 is ready for pickup",
  "data": {
    "orderId": "507f1f77bcf86cd799439011",
    "status": "READY",
    "readyAt": "2024-01-15T10:45:00.000Z",
    "items": [...]
  }
}
```

---

## 🔔 Notification Service (Puerto 3003)
**Servicio de notificaciones - Solo consume eventos de RabbitMQ**

### Health Check
```
GET http://localhost:3003/health
```

### Flujo Automático (RabbitMQ)
**Este servicio NO tiene endpoints REST para crear/consultar.**
- Consume `order.created` de RabbitMQ automáticamente
- Consume `order.ready` de RabbitMQ automáticamente
- Envía notificaciones vía SSE a clientes conectados

### Stream de Notificaciones (SSE - Frontend)
```
GET http://localhost:3003/notifications/stream

Nota: Este endpoint es para Server-Sent Events (SSE).
- El frontend se conecta aquí para recibir notificaciones en tiempo real
- No funciona bien en Postman, usa un cliente SSE o el frontend
- Las notificaciones se envían automáticamente cuando se consumen eventos de RabbitMQ
```

---

## 🔄 Flujo Completo de Prueba en Postman

### Paso 1: Crear un Pedido (Cliente)
```
POST http://localhost:3000/orders
Content-Type: application/json

{
  "customerName": "Test User",
  "customerEmail": "test@example.com",
  "items": [
    {
      "name": "Pizza Margherita",
      "quantity": 1,
      "price": 20.00
    }
  ]
}
```

**Lo que sucede automáticamente:**
1. ✅ API Gateway enruta a Order Service
2. ✅ Order Service guarda en MongoDB (orders)
3. ✅ Order Service publica `order.created` a RabbitMQ
4. ✅ Kitchen Service consume `order.created` y guarda en MongoDB (kitchen_orders)
5. ✅ Notification Service consume `order.created` y envía notificación

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Pedido creado exitosamente",
  "data": {
    "order": {
      "id": "507f1f77bcf86cd799439011",
      "orderNumber": "ORD-1234567890-001",
      "customerName": "Test User",
      "items": [...],
      "total": 20.00,
      "status": "pending",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  }
}
```

**Guarda el `id` o `orderNumber` para los siguientes pasos**

### Paso 2: Verificar que el Pedido Apareció en Cocina
```
GET http://localhost:3000/kitchen/orders
```

**O directamente:**
```
GET http://localhost:3002/api/kitchen/orders
```

**Deberías ver el pedido con status: "RECEIVED"**

**Lo que sucede:**
- Kitchen Service consulta su MongoDB (kitchen_orders)
- Muestra todos los pedidos recibidos vía RabbitMQ

### Paso 3: Consultar Estado del Pedido (Cliente)
```
GET http://localhost:3000/orders/{orderId}
```

**O para solo el estado:**
```
GET http://localhost:3000/orders/{orderId}/status
```

**Deberías ver status: "pending"**

### Paso 4: Iniciar Preparación (Opcional - Manual desde Vista Cocina)
```
POST http://localhost:3002/api/kitchen/orders/{orderId}/start-preparing
```

**Lo que sucede:**
- Kitchen Service actualiza status a "PREPARING" en MongoDB
- Publica evento "order.preparing" a RabbitMQ

### Paso 5: Marcar como Listo (Manual desde Vista Cocina)
```
POST http://localhost:3002/api/kitchen/orders/{orderId}/ready
```

**Lo que sucede automáticamente:**
1. ✅ Kitchen Service actualiza status a "READY" en MongoDB
2. ✅ Kitchen Service publica `order.ready` a RabbitMQ
3. ✅ Order Service consume `order.ready` y actualiza su estado a "ready"
4. ✅ Notification Service consume `order.ready` y envía notificación

### Paso 6: Verificar Estado Final (Cliente)
```
GET http://localhost:3000/orders/{orderId}/status
```

**Deberías ver status: "ready"**

---

## 📝 Notas Importantes

### Arquitectura de Microservicios

1. **API Gateway (Puerto 3000)**: 
   - ✅ Punto de entrada único para el frontend
   - ✅ Enruta requests a servicios backend
   - ✅ Valida datos de entrada
   - ✅ Maneja errores centralizadamente

2. **Order Service (Puerto 3001)**:
   - ✅ Gestiona pedidos (CRUD)
   - ✅ Guarda en MongoDB (colección: orders)
   - ✅ Publica eventos a RabbitMQ
   - ✅ Consume `order.ready` para actualizar estado

3. **Kitchen Service (Puerto 3002)**:
   - ✅ Consume `order.created` de RabbitMQ automáticamente
   - ✅ Guarda en MongoDB (colección: kitchen_orders)
   - ✅ Publica `order.ready` cuando el pedido está listo
   - ✅ Endpoints REST solo para vista de cocina (internos)

4. **Notification Service (Puerto 3003)**:
   - ✅ Solo consume eventos de RabbitMQ
   - ✅ NO tiene endpoints REST (excepto SSE)
   - ✅ Envía notificaciones en tiempo real vía SSE

### Estados del Sistema

**Estados en Order Service:**
- `pending`: Pedido creado, esperando procesamiento
- `preparing`: En cocina, siendo preparado (actualizado cuando kitchen inicia)
- `ready`: Listo para entregar (actualizado cuando kitchen marca como listo)

**Estados en Kitchen Service:**
- `RECEIVED`: Pedido recibido en cocina (automático vía RabbitMQ)
- `PREPARING`: En preparación (manual o automático)
- `READY`: Listo para recoger (manual)

### Flujo de Eventos RabbitMQ

```
Order Service → order.created → RabbitMQ
                                    ↓
                    ┌───────────────┴───────────────┐
                    ↓                               ↓
            Kitchen Service              Notification Service
            (consume)                    (consume)
                    ↓
            Guarda en MongoDB
                    ↓
            (Manual) start-preparing
                    ↓
            (Manual) mark-as-ready
                    ↓
            order.ready → RabbitMQ
                    ↓
        ┌───────────┴───────────┐
        ↓                       ↓
Order Service          Notification Service
(consume)              (consume)
Actualiza estado       Envía notificación
```

### Recomendaciones para Postman

1. **Para pruebas del Cliente**: Usa siempre el API Gateway (puerto 3000)
2. **Para pruebas de Cocina**: Puedes usar directamente Kitchen Service (puerto 3002)
3. **Para debugging**: Accede directamente a los servicios (3001, 3002, 3003)
4. **Order ID**: Guarda el `id` de la respuesta al crear un pedido para usarlo en otros endpoints

---

## 🧪 Colección de Postman Recomendada

Crea una colección con estas carpetas:
- **API Gateway** (puerto 3000)
- **Order Service** (puerto 3001)
- **Kitchen Service** (puerto 3002)
- **Notification Service** (puerto 3003)

Y guarda variables:
- `base_url_gateway`: `http://localhost:3000`
- `base_url_order`: `http://localhost:3001`
- `base_url_kitchen`: `http://localhost:3002`
- `base_url_notification`: `http://localhost:3003`
- `order_id`: (se actualiza después de crear un pedido)

