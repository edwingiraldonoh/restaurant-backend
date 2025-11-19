import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// TODO: Conectar a MongoDB
// TODO: Configurar RabbitMQ para consumir order.created
// TODO: Configurar RabbitMQ para publicar order.ready

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'kitchen-service' });
});

// TODO: Endpoint para obtener pedidos en cocina
// GET /orders

app.listen(PORT, () => {
  console.log(`👨‍🍳 Kitchen Service corriendo en puerto ${PORT}`);
});

