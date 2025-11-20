import request from 'supertest';
import express from 'express';
import { KitchenOrder } from '../../src/models/KitchenOrder';
import { RabbitMQClient } from '../../src/rabbitmq/rabbitmqClient';
import { KitchenService } from '../../src/services/kitchenService';

// Mock de RabbitMQ para tests de integración
jest.mock('../../src/rabbitmq/rabbitmqClient');

describe('Kitchen Service API - Integration Tests', () => {
  let app: express.Application;
  let kitchenService: KitchenService;
  let mockRabbitMQ: jest.Mocked<RabbitMQClient>;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    mockRabbitMQ = new RabbitMQClient() as jest.Mocked<RabbitMQClient>;
    mockRabbitMQ.publish = jest.fn().mockResolvedValue(undefined);
    kitchenService = new KitchenService(mockRabbitMQ);

    // Definir rutas
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', service: 'kitchen-service' });
    });

    app.get('/orders', async (req, res) => {
      try {
        const orders = await kitchenService.getAllOrders();
        res.json(orders);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
      }
    });

    app.get('/orders/:orderId', async (req, res) => {
      try {
        const order = await kitchenService.getOrderById(req.params.orderId);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        res.json(order);
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch order' });
      }
    });

    app.patch('/orders/:orderId/start', async (req, res) => {
      try {
        const order = await kitchenService.startPreparing(req.params.orderId);
        res.json(order);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    });

    app.patch('/orders/:orderId/complete', async (req, res) => {
      try {
        const order = await kitchenService.markAsReady(req.params.orderId);
        res.json(order);
      } catch (error: any) {
        res.status(400).json({ error: error.message });
      }
    });
  });

  describe('GET /health', () => {
    it('debe retornar status ok', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        status: 'ok',
        service: 'kitchen-service'
      });
    });
  });

  describe('GET /orders', () => {
    it('debe retornar lista vacía inicialmente', async () => {
      const response = await request(app).get('/orders');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('debe retornar todas las órdenes', async () => {
      // Crear órdenes de prueba
      await KitchenOrder.create({
        orderId: 'order-1',
        userId: 'user-1',
        items: [{ name: 'Pizza', quantity: 1 }]
      });
      await KitchenOrder.create({
        orderId: 'order-2',
        userId: 'user-2',
        items: [{ name: 'Burger', quantity: 2 }]
      });

      const response = await request(app).get('/orders');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  describe('GET /orders/:orderId', () => {
    it('debe retornar orden específica', async () => {
      await KitchenOrder.create({
        orderId: 'order-specific',
        userId: 'user-specific',
        items: [{ name: 'Pasta', quantity: 1, price: 12.99 }],
        status: 'RECEIVED'
      });

      const response = await request(app).get('/orders/order-specific');

      expect(response.status).toBe(200);
      expect(response.body.orderId).toBe('order-specific');
      expect(response.body.status).toBe('RECEIVED');
    });

    it('debe retornar 404 si orden no existe', async () => {
      const response = await request(app).get('/orders/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Order not found');
    });
  });

  describe('PATCH /orders/:orderId/start', () => {
    it('debe iniciar preparación de orden', async () => {
      await KitchenOrder.create({
        orderId: 'order-to-start',
        userId: 'user-to-start',
        items: [{ name: 'Steak', quantity: 1 }],
        status: 'RECEIVED'
      });

      const response = await request(app)
        .patch('/orders/order-to-start/start');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('PREPARING');
      expect(response.body.preparingAt).toBeDefined();
    });

    it('debe retornar 400 si orden no existe', async () => {
      const response = await request(app)
        .patch('/orders/non-existent/start');

      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /orders/:orderId/complete', () => {
    it('debe completar orden en preparing', async () => {
      await KitchenOrder.create({
        orderId: 'order-to-complete',
        userId: 'user-to-complete',
        items: [{ name: 'Fish', quantity: 1 }],
        status: 'PREPARING',
        preparingAt: new Date()
      });

      const response = await request(app)
        .patch('/orders/order-to-complete/complete');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('READY');
      expect(response.body.readyAt).toBeDefined();
    });

    it('debe retornar 400 si orden no está en preparing', async () => {
      await KitchenOrder.create({
        orderId: 'order-wrong-status',
        userId: 'user-wrong-status',
        items: [{ name: 'Soup', quantity: 1 }],
        status: 'RECEIVED'
      });

      const response = await request(app)
        .patch('/orders/order-wrong-status/complete');

      expect(response.status).toBe(400);
    });
  });

  describe('Flujo completo de orden', () => {
    it('debe procesar orden completa: received → preparing → ready', async () => {
      // 1. Simular orden recibida
      await kitchenService.handleOrderCreated({
        orderId: 'full-flow-order',
        userId: 'user-full-flow',
        items: [
          { name: 'Pizza Margherita', quantity: 2, price: 15.99 },
          { name: 'Coca Cola', quantity: 2, price: 2.99 }
        ]
      });

      // Verificar estado inicial
      let response = await request(app).get('/orders/full-flow-order');
      expect(response.body.status).toBe('RECEIVED');

      // 2. Iniciar preparación
      response = await request(app).patch('/orders/full-flow-order/start');
      expect(response.body.status).toBe('PREPARING');

      // 3. Completar orden
      response = await request(app).patch('/orders/full-flow-order/complete');
      expect(response.body.status).toBe('READY');

      // Verificar que se publicaron todos los eventos
      expect(mockRabbitMQ.publish).toHaveBeenCalledTimes(3);
      expect(mockRabbitMQ.publish).toHaveBeenCalledWith('order.received', expect.any(Object));
      expect(mockRabbitMQ.publish).toHaveBeenCalledWith('order.preparing', expect.any(Object));
      expect(mockRabbitMQ.publish).toHaveBeenCalledWith('order.ready', expect.any(Object));
    });
  });
});