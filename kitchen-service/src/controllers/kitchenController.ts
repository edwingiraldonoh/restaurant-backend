import { Request, Response } from 'express';
import { KitchenService } from '../services/kitchenService';

export class KitchenController {
  constructor(private kitchenService: KitchenService) {}

  /**
   * POST /orders/:orderId/start-preparing
   * Endpoint 5: Cocinero inicia preparación
   */
  startPreparing = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        res.status(400).json({
          success: false,
          message: 'Order ID is required'
        });
        return;
      }

      const order = await this.kitchenService.startPreparing(orderId);

      res.status(200).json({
        success: true,
        message: `Order ${orderId} is now being prepared`,
        data: {
          orderId: order.orderId,
          status: order.status,
          preparingAt: order.preparingAt,
          estimatedTime: order.estimatedTime,
          items: order.items
        }
      });

    } catch (error: any) {
      console.error('❌ Error in startPreparing:', error);
      
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }

      if (error.message.includes('cannot start preparing')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  };

  /**
   * POST /orders/:orderId/ready
   * Endpoint 8: Cocinero marca como listo
   */
  markAsReady = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        res.status(400).json({
          success: false,
          message: 'Order ID is required'
        });
        return;
      }

      const order = await this.kitchenService.markAsReady(orderId);

      res.status(200).json({
        success: true,
        message: `Order ${orderId} is ready for pickup`,
        data: {
          orderId: order.orderId,
          status: order.status,
          readyAt: order.readyAt,
          preparingAt: order.preparingAt,
          receivedAt: order.receivedAt,
          items: order.items
        }
      });

    } catch (error: any) {
      console.error('❌ Error in markAsReady:', error);
      
      if (error.message.includes('not found')) {
        res.status(404).json({
          success: false,
          message: error.message
        });
        return;
      }

      if (error.message.includes('cannot be marked as ready')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  };

  /**
   * GET /orders
   * Obtiene todos los pedidos en cocina (con filtro opcional por status)
   */
  getAllOrders = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status } = req.query;

      const orders = await this.kitchenService.getAllOrders(status as string);

      res.status(200).json({
        success: true,
        count: orders.length,
        data: orders
      });

    } catch (error: any) {
      console.error('❌ Error in getAllOrders:', error);
      
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  };

  /**
   * GET /orders/:orderId
   * Obtiene un pedido específico
   */
  getOrderById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        res.status(400).json({
          success: false,
          message: 'Order ID is required'
        });
        return;
      }

      const order = await this.kitchenService.getOrderById(orderId);

      if (!order) {
        res.status(404).json({
          success: false,
          message: `Order ${orderId} not found`
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: order
      });

    } catch (error: any) {
      console.error('❌ Error in getOrderById:', error);
      
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  };
}
