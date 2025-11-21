import { KitchenService } from '../../../src/services/kitchenService';
import { KitchenOrder } from '../../../src/models/KitchenOrder';
import { RabbitMQClient } from '../../../src/rabbitmq/rabbitmqClient';

// Mock de RabbitMQ
jest.mock('../../../src/rabbitmq/rabbitmqClient');

describe('KitchenService - Unit Tests', () => {
  let kitchenService: KitchenService;
  let mockRabbitMQ: jest.Mocked<RabbitMQClient>;

  beforeEach(() => {
    mockRabbitMQ = new RabbitMQClient() as jest.Mocked<RabbitMQClient>;
    mockRabbitMQ.publish = jest.fn().mockResolvedValue(undefined);
    
    kitchenService = new KitchenService(mockRabbitMQ);
  });

  describe('handleOrderCreated', () => {
    it('debe crear orden en estado "received"', async () => {
      const orderData = {
        orderId: 'order-001',
        userId: 'user-001',
        items: [
          { name: 'Pizza Margherita', quantity: 2, price: 12.99 }
        ]
      };

      await kitchenService.handleOrderCreated(orderData);

      const order = await KitchenOrder.findOne({ orderId: 'order-001' });
      
      expect(order).toBeDefined();
      expect(order?.status).toBe('RECEIVED');
      expect(order?.items).toHaveLength(1);
      expect(order?.receivedAt).toBeInstanceOf(Date);
    });

    it('debe publicar evento order.received', async () => {
      const orderData = {
        orderId: 'order-002',
        userId: 'user-002',
        items: [{ name: 'Burger', quantity: 1, price: 8.99 }]
      };

      await kitchenService.handleOrderCreated(orderData);

      expect(mockRabbitMQ.publish).toHaveBeenCalledWith(
        'order.received',
        expect.objectContaining({
          type: 'order.received',
          orderId: 'order-002',
          userId: 'user-002',
          status: 'RECEIVED',
          timestamp: expect.any(String),
          data: expect.objectContaining({
            receivedAt: expect.any(Date),
            estimatedTime: expect.any(Number),
            items: expect.any(Array)
          })
        })
      );
    });

    it('debe manejar errores al crear orden duplicada', async () => {
      const orderData = {
        orderId: 'order-duplicate',
        userId: 'user-duplicate',
        items: [{ name: 'Pizza', quantity: 1 }]
      };

      await kitchenService.handleOrderCreated(orderData);

      // La segunda vez debería retornar la orden existente (idempotencia)
      const secondOrder = await kitchenService.handleOrderCreated(orderData);
      expect(secondOrder.orderId).toBe('order-duplicate');
    });
  });

  describe('startPreparingOrder', () => {
    it('debe cambiar status de received a preparing', async () => {
      // Crear orden en estado received
      await KitchenOrder.create({
        orderId: 'order-003',
        userId: 'user-003',
        items: [{ name: 'Pasta', quantity: 1 }],
        status: 'RECEIVED'
      });

      const order = await kitchenService.startPreparing('order-003');

      expect(order.status).toBe('PREPARING');
      expect(order.preparingAt).toBeInstanceOf(Date);
    });

    it('debe publicar evento order.preparing', async () => {
      await KitchenOrder.create({
        orderId: 'order-004',
        userId: 'user-004',
        items: [{ name: 'Salad', quantity: 1 }],
        status: 'RECEIVED',
        estimatedTime: 7 // Calcular: 5 + (1 * 2) = 7 minutos
      });

      await kitchenService.startPreparing('order-004');

      expect(mockRabbitMQ.publish).toHaveBeenCalledWith(
        'order.preparing',
        expect.objectContaining({
          type: 'order.preparing',
          orderId: 'order-004',
          userId: 'user-004',
          status: 'PREPARING',
          timestamp: expect.any(String),
          data: expect.objectContaining({
            preparingAt: expect.any(Date),
            estimatedTime: expect.anything() // Puede ser number o undefined
          })
        })
      );
    });

    it('debe fallar si orden no existe', async () => {
      await expect(
        kitchenService.startPreparing('non-existent')
      ).rejects.toThrow('not found');
    });

    it('debe fallar si orden ya está en preparing', async () => {
      await KitchenOrder.create({
        orderId: 'order-005',
        userId: 'user-005',
        items: [{ name: 'Pizza', quantity: 1 }],
        status: 'PREPARING'  // Ya en preparing
      });

      await expect(
        kitchenService.startPreparing('order-005')
      ).rejects.toThrow('cannot start preparing');
    });
  });

  describe('completeOrder', () => {
    it('debe cambiar status de preparing a ready', async () => {
      await KitchenOrder.create({
        orderId: 'order-006',
        userId: 'user-006',
        items: [{ name: 'Steak', quantity: 1 }],
        status: 'PREPARING',
        preparingAt: new Date()
      });

      const order = await kitchenService.markAsReady('order-006');

      expect(order.status).toBe('READY');
      expect(order.readyAt).toBeInstanceOf(Date);
    });

    it('debe publicar evento order.ready', async () => {
      await KitchenOrder.create({
        orderId: 'order-007',
        userId: 'user-007',
        items: [{ name: 'Fish', quantity: 1 }],
        status: 'PREPARING'
      });

      await kitchenService.markAsReady('order-007');

      expect(mockRabbitMQ.publish).toHaveBeenCalledWith(
        'order.ready',
        expect.objectContaining({
          type: 'order.ready',
          orderId: 'order-007',
          userId: 'user-007',
          status: 'READY',
          timestamp: expect.any(String),
          data: expect.objectContaining({
            readyAt: expect.any(Date),
            receivedAt: expect.any(Date),
            items: expect.any(Array)
          })
        })
      );
    });

    it('debe fallar si orden no está en preparing', async () => {
      await KitchenOrder.create({
        orderId: 'order-008',
        userId: 'user-008',
        items: [{ name: 'Soup', quantity: 1 }],
        status: 'RECEIVED'  // No está en preparing
      });

      await expect(
        kitchenService.markAsReady('order-008')
      ).rejects.toThrow('cannot be marked as ready');
    });
  });

  describe('getAllOrders', () => {
    it('debe retornar todas las órdenes ordenadas por fecha', async () => {
      await KitchenOrder.create({
        orderId: 'order-009',
        userId: 'user-009',
        items: [{ name: 'Item 1', quantity: 1 }]
      });
      
      await KitchenOrder.create({
        orderId: 'order-010',
        userId: 'user-010',
        items: [{ name: 'Item 2', quantity: 1 }]
      });

      const orders = await kitchenService.getAllOrders();

      expect(orders).toHaveLength(2);
      // Más recientes primero
      expect(orders[0].orderId).toBe('order-010');
    });

    it('debe retornar array vacío si no hay órdenes', async () => {
      const orders = await kitchenService.getAllOrders();
      expect(orders).toHaveLength(0);
    });
  });

  describe('getOrderById', () => {
    it('debe retornar orden específica', async () => {
      await KitchenOrder.create({
        orderId: 'order-011',
        userId: 'user-011',
        items: [{ name: 'Special Pizza', quantity: 1 }]
      });

      const order = await kitchenService.getOrderById('order-011');

      expect(order).toBeDefined();
      expect(order?.orderId).toBe('order-011');
    });

    it('debe retornar null si orden no existe', async () => {
      const order = await kitchenService.getOrderById('non-existent');
      expect(order).toBeNull();
    });
  });
});