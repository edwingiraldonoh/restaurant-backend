import { Router } from 'express';
import { getKitchenOrders } from '../controllers/kitchenController';

const router = Router();

// GET /kitchen/orders - Obtener todos los pedidos en cocina
router.get('/orders', getKitchenOrders);

export default router;

