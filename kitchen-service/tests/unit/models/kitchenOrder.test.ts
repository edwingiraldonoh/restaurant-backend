import { KitchenOrder } from '../../../src/models/KitchenOrder';

describe('KitchenOrder Model - Unit Tests', () => {
  
  describe('Schema Validation', () => {
    it('debe crear una orden válida con campos requeridos', async () => {
      const orderData = {
        orderId: 'order-123',
        userId: 'user-456',
        items: [
          { name: 'Pizza', quantity: 2, price: 15.99 }
        ],
        status: 'RECEIVED'
      };

      const order = await KitchenOrder.create(orderData);

      expect(order.orderId).toBe('order-123');
      expect(order.userId).toBe('user-456');
      expect(order.items).toHaveLength(1);
      expect(order.status).toBe('RECEIVED');
      expect(order.receivedAt).toBeInstanceOf(Date);
      expect(order.createdAt).toBeDefined();
      expect(order.updatedAt).toBeDefined();
    });

    it('debe fallar si falta orderId', async () => {
      const orderData = {
        userId: 'user-123',
        items: [{ name: 'Pizza', quantity: 1 }],
        status: 'RECEIVED'
      };

      await expect(KitchenOrder.create(orderData)).rejects.toThrow();
    });

    it('debe fallar si status no es válido', async () => {
      const orderData = {
        orderId: 'order-123',
        userId: 'user-123',
        items: [{ name: 'Pizza', quantity: 1 }],
        status: 'invalid-status' // Estado inválido
      };

      await expect(KitchenOrder.create(orderData)).rejects.toThrow();
    });

    it('debe tener status "RECEIVED" por defecto', async () => {
      const order = await KitchenOrder.create({
        orderId: 'order-456',
        userId: 'user-456',
        items: [{ name: 'Burger', quantity: 1 }]
      });

      expect(order.status).toBe('RECEIVED');
    });

    it('debe evitar orderId duplicados', async () => {
      await KitchenOrder.create({
        orderId: 'order-duplicate',
        userId: 'user-123',
        items: [{ name: 'Pizza', quantity: 1 }]
      });

      // Intentar crear otra con mismo orderId
      await expect(
        KitchenOrder.create({
          orderId: 'order-duplicate',
          userId: 'user-456',
          items: [{ name: 'Burger', quantity: 1 }]
        })
      ).rejects.toThrow();
    });
  });

  describe('Items Array', () => {
    it('debe permitir múltiples items', async () => {
      const order = await KitchenOrder.create({
        orderId: 'order-multi',
        userId: 'user-multi',
        items: [
          { name: 'Pizza', quantity: 2, price: 15.99 },
          { name: 'Coca Cola', quantity: 3, price: 2.99 },
          { name: 'Burger', quantity: 1, price: 10.50 }
        ]
      });

      expect(order.items).toHaveLength(3);
      expect(order.items[1].name).toBe('Coca Cola');
      expect(order.items[1].quantity).toBe(3);
    });

    it('debe permitir price opcional', async () => {
      const order = await KitchenOrder.create({
        orderId: 'order-no-price',
        userId: 'user-no-price',
        items: [
          { name: 'Special Item', quantity: 1 } // Sin price
        ]
      });

      expect(order.items[0].price).toBeUndefined();
    });
  });

  describe('Timestamps', () => {
    it('debe actualizar updatedAt al modificar orden', async () => {
      const order = await KitchenOrder.create({
        orderId: 'order-timestamp',
        userId: 'user-timestamp',
        items: [{ name: 'Pizza', quantity: 1 }]
      });

      const originalUpdatedAt = order.updatedAt;

      // Esperar un poco y actualizar
      await new Promise(resolve => setTimeout(resolve, 100));
      
      order.status = 'PREPARING';
      await order.save();

      expect(order.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});