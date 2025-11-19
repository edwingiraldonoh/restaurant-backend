import { Request, Response } from 'express';
import { kitchenService } from '../services/httpClient';
import { HttpResponse } from '../utils/httpResponse';

/**
 * Controlador para obtener todos los pedidos en cocina
 * GET /kitchen/orders
 */
export const getKitchenOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await kitchenService.getKitchenOrders();
    HttpResponse.fromServiceResponse(res, result);
  } catch (error) {
    console.error('Error en getKitchenOrders:', error);
    HttpResponse.error(res, 'Error interno del servidor al obtener los pedidos de cocina', 500);
  }
};

