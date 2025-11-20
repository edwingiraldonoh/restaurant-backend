import { Router } from 'express';
import { KitchenController } from '../controllers/kitchenController';

export const createKitchenRoutes = (kitchenController: KitchenController): Router => {
  const router = Router();

  // GET /orders - Obtiene todos los pedidos (con filtro opcional ?status=RECEIVED)
  router.get('/orders', kitchenController.getAllOrders);

  // GET /orders/:orderId - Obtiene un pedido específico
  router.get('/orders/:orderId', kitchenController.getOrderById);

  // POST /orders/:orderId/start-preparing - Cocinero inicia preparación (paso 5 del flujo)
  router.post('/orders/:orderId/start-preparing', kitchenController.startPreparing);

  // POST /orders/:orderId/ready - Cocinero marca como listo (paso 8 del flujo)
  router.post('/orders/:orderId/ready', kitchenController.markAsReady);

  return router;
};
