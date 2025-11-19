import { Router } from 'express';
import { createOrder, getOrderById } from '../controllers/orderController';

const router = Router();

// POST /orders - Crear un nuevo pedido
router.post('/', createOrder);

// GET /orders/:id - Obtener un pedido por su ID
router.get('/:id', getOrderById);

export default router;

