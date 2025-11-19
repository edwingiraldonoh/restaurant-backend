import { Request, Response } from 'express';
import { createOrder, getOrderById } from '../controllers/orderController';
import { orderService } from '../services/httpClient';
import { OrderValidator } from '../validators/orderValidator';
import { HttpResponse } from '../utils/httpResponse';

// Mock de dependencias
jest.mock('../services/httpClient');
jest.mock('../validators/orderValidator');
jest.mock('../utils/httpResponse');

describe('OrderController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };
    mockRequest = {
      body: {},
      params: {},
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('debería crear un pedido exitosamente', async () => {
      const orderData = {
        orderItems: [
          {
            dishName: 'Pizza',
            quantity: 1,
            unitPrice: 15.99,
          },
        ],
        customerName: 'Juan Pérez',
        customerEmail: 'juan@example.com',
      };

      mockRequest.body = orderData;
      (OrderValidator.validateCreateOrder as jest.Mock).mockReturnValue({
        valid: true,
      });
      (orderService.createOrder as jest.Mock).mockResolvedValue({
        success: true,
        data: { id: 'order-123', ...orderData },
      });

      await createOrder(mockRequest as Request, mockResponse as Response);

      expect(OrderValidator.validateCreateOrder).toHaveBeenCalledWith(mockRequest);
      expect(orderService.createOrder).toHaveBeenCalledWith(orderData);
      expect(HttpResponse.success).toHaveBeenCalled();
    });

    it('debería retornar error 400 si la validación falla', async () => {
      mockRequest.body = {};
      (OrderValidator.validateCreateOrder as jest.Mock).mockReturnValue({
        valid: false,
        message: 'El cuerpo de la petición está vacío',
      });

      await createOrder(mockRequest as Request, mockResponse as Response);

      expect(OrderValidator.validateCreateOrder).toHaveBeenCalled();
      expect(HttpResponse.error).toHaveBeenCalledWith(
        mockResponse,
        'El cuerpo de la petición está vacío',
        400
      );
      expect(orderService.createOrder).not.toHaveBeenCalled();
    });
  });

  describe('getOrderById', () => {
    it('debería obtener un pedido por ID exitosamente', async () => {
      const orderId = 'order-123';
      mockRequest.params = { id: orderId };
      (OrderValidator.validateOrderId as jest.Mock).mockReturnValue({
        valid: true,
      });
      (orderService.getOrderById as jest.Mock).mockResolvedValue({
        success: true,
        data: { id: orderId, status: 'pending' },
      });

      await getOrderById(mockRequest as Request, mockResponse as Response);

      expect(OrderValidator.validateOrderId).toHaveBeenCalledWith(mockRequest);
      expect(orderService.getOrderById).toHaveBeenCalledWith(orderId);
      expect(HttpResponse.success).toHaveBeenCalled();
    });

    it('debería retornar error 400 si el ID no está presente', async () => {
      mockRequest.params = {};
      (OrderValidator.validateOrderId as jest.Mock).mockReturnValue({
        valid: false,
        message: 'Se requiere el ID del pedido',
      });

      await getOrderById(mockRequest as Request, mockResponse as Response);

      expect(HttpResponse.error).toHaveBeenCalledWith(
        mockResponse,
        'Se requiere el ID del pedido',
        400
      );
    });

    it('debería retornar error 404 si el pedido no existe', async () => {
      const orderId = 'order-not-found';
      mockRequest.params = { id: orderId };
      (OrderValidator.validateOrderId as jest.Mock).mockReturnValue({
        valid: true,
      });
      (orderService.getOrderById as jest.Mock).mockResolvedValue({
        success: false,
        status: 404,
        message: 'Pedido no encontrado',
      });

      await getOrderById(mockRequest as Request, mockResponse as Response);

      expect(HttpResponse.error).toHaveBeenCalledWith(
        mockResponse,
        `Pedido con ID ${orderId} no encontrado`,
        404
      );
    });
  });
});

