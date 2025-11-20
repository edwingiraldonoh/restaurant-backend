import { KitchenOrder, IKitchenOrder } from '../models/KitchenOrder';
import { RabbitMQClient } from '../rabbitmq/rabbitmqClient';

export interface OrderCreatedEvent {
  orderId: string;
  userId: string;
  customerName?: string;
  customerEmail?: string;
  items: Array<{
    name: string;
    quantity: number;
    price?: number;
  }>;
  notes?: string;
}

export class KitchenService {
  constructor(private rabbitMQClient: RabbitMQClient) {}

  /**
   * Maneja el evento order.created del order-service
   * 2. Guarda en MongoDB
   * 3. Publica order.received
   */
  async handleOrderCreated(orderData: OrderCreatedEvent): Promise<IKitchenOrder> {
    try {
      console.log(`🍳 Processing new order: ${orderData.orderId}`);

      // Verificar si ya existe (idempotencia)
      const existingOrder = await KitchenOrder.findOne({ orderId: orderData.orderId });
      if (existingOrder) {
        console.log(`⚠️ Order ${orderData.orderId} already exists, skipping...`);
        return existingOrder;
      }

      // Crear orden en kitchen
      const kitchenOrder = new KitchenOrder({
        orderId: orderData.orderId,
        userId: orderData.userId,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        items: orderData.items,
        status: 'RECEIVED',
        receivedAt: new Date(),
        notes: orderData.notes,
        estimatedTime: this.calculateEstimatedTime(orderData.items)
      });

      await kitchenOrder.save();
      console.log(`✅ Kitchen order saved: ${orderData.orderId}`);

      // Publicar evento order.received para notification-service
      await this.rabbitMQClient.publish('order.received', {
        orderId: orderData.orderId,
        userId: orderData.userId,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        status: 'RECEIVED',
        receivedAt: kitchenOrder.receivedAt,
        estimatedTime: kitchenOrder.estimatedTime,
        items: orderData.items
      });

      console.log(`📤 Event published: order.received for ${orderData.orderId}`);

      return kitchenOrder;
    } catch (error) {
      console.error(`❌ Error handling order.created:`, error);
      throw error;
    }
  }

  /**
   * 5. Inicia la preparación del pedido
   * 6. Publica order.preparing
   */
  async startPreparing(orderId: string): Promise<IKitchenOrder> {
    try {
      const order = await KitchenOrder.findOne({ orderId });

      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      if (order.status !== 'RECEIVED') {
        throw new Error(`Order ${orderId} cannot start preparing. Current status: ${order.status}`);
      }

      // Actualizar estado
      order.status = 'PREPARING';
      order.preparingAt = new Date();
      await order.save();

      console.log(`👨‍🍳 Order ${orderId} is now PREPARING`);

      // Publicar evento order.preparing para notification-service
      await this.rabbitMQClient.publish('order.preparing', {
        orderId: order.orderId,
        userId: order.userId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        status: 'PREPARING',
        preparingAt: order.preparingAt,
        estimatedTime: order.estimatedTime
      });

      console.log(`📤 Event published: order.preparing for ${orderId}`);

      return order;
    } catch (error) {
      console.error(`❌ Error starting preparation:`, error);
      throw error;
    }
  }

  /**
   * 8. Marca el pedido como listo
   * 9. Publica order.ready
   */
  async markAsReady(orderId: string): Promise<IKitchenOrder> {
    try {
      const order = await KitchenOrder.findOne({ orderId });

      if (!order) {
        throw new Error(`Order ${orderId} not found`);
      }

      if (order.status !== 'PREPARING') {
        throw new Error(`Order ${orderId} cannot be marked as ready. Current status: ${order.status}`);
      }

      // Actualizar estado
      order.status = 'READY';
      order.readyAt = new Date();
      await order.save();

      console.log(`✅ Order ${orderId} is now READY`);

      // Publicar evento order.ready para notification-service
      await this.rabbitMQClient.publish('order.ready', {
        orderId: order.orderId,
        userId: order.userId,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        status: 'READY',
        readyAt: order.readyAt,
        receivedAt: order.receivedAt,
        preparingAt: order.preparingAt,
        items: order.items
      });

      console.log(`📤 Event published: order.ready for ${orderId}`);

      return order;
    } catch (error) {
      console.error(`❌ Error marking order as ready:`, error);
      throw error;
    }
  }

  /**
   * Obtiene todos los pedidos en cocina
   */
  async getAllOrders(status?: string): Promise<IKitchenOrder[]> {
    try {
      const filter = status ? { status: status.toUpperCase() } : {};
      return await KitchenOrder.find(filter).sort({ receivedAt: -1 });
    } catch (error) {
      console.error(`❌ Error fetching orders:`, error);
      throw error;
    }
  }

  /**
   * Obtiene un pedido específico
   */
  async getOrderById(orderId: string): Promise<IKitchenOrder | null> {
    try {
      return await KitchenOrder.findOne({ orderId });
    } catch (error) {
      console.error(`❌ Error fetching order:`, error);
      throw error;
    }
  }

  /**
   * Calcula tiempo estimado basado en cantidad de items
   */
  private calculateEstimatedTime(items: Array<{ quantity: number }>): number {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    // 5 minutos base + 2 minutos por item
    return 5 + (totalItems * 2);
  }
}
