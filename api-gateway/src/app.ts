import express from 'express';
import cors from 'cors';
import orderRoutes from './routes/orderRoutes';
import kitchenRoutes from './routes/kitchenRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/orders', orderRoutes);
app.use('/kitchen', kitchenRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

app.listen(PORT, () => {
  console.log(`🚪 API Gateway corriendo en puerto ${PORT}`);
});

