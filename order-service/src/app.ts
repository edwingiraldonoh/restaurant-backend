import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// TODO: Conectar a MongoDB
// TODO: Configurar RabbitMQ
// TODO: Importar y usar las rutas

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'order-service' });
});

app.listen(PORT, () => {
  console.log(`📋 Order Service corriendo en puerto ${PORT}`);
});

