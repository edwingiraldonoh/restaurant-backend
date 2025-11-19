import { Router } from 'express';
import { createOrder, getOrderById } from '../controllers/orderController';

const router = Router();

// POST /orders - Crear pedido
router.post('/', createOrder);

// GET /orders/:id - Consultar estado de pedido
router.get('/:id', getOrderById);

export default router;

