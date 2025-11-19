/**
 * Respuesta estándar de servicios
 */
export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  status?: number;
  message?: string;
  error?: any;
}

/**
 * Request para crear un nuevo pedido
 */
export interface CreateOrderRequest {
  orderItems: OrderLineItem[];
  customerName: string;
  customerEmail: string;
  notes?: string;
}

/**
 * Item individual de un pedido (línea de pedido)
 * Representa un plato/producto del menú con su cantidad y precio
 */
export interface OrderLineItem {
  dishName: string;
  quantity: number;
  unitPrice: number;
}

/**
 * Pedido completo del restaurante
 */
export interface Order {
  id: string;
  orderItems: OrderLineItem[];
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  totalAmount?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Estados posibles de un pedido
 */
export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

/**
 * Pedido en cocina (vista simplificada para el servicio de cocina)
 */
export interface KitchenOrder {
  id: string;
  orderId: string;
  orderItems: OrderLineItem[];
  status: OrderStatus;
  createdAt: string;
}

