import { BaseHttpClient } from './baseHttpClient';
import { CreateOrderRequest, Order, KitchenOrder } from '../types';
import { config } from '../config';

const orderServiceClient = new BaseHttpClient(
  config.services.orderService.url,
  config.services.orderService.timeout
);
const kitchenServiceClient = new BaseHttpClient(
  config.services.kitchenService.url,
  config.services.kitchenService.timeout
);


export const orderService = {
  createOrder: (orderData: CreateOrderRequest) => orderServiceClient.post<Order>('/orders', orderData),
  getOrderById: (orderId: string) => orderServiceClient.get<Order>(`/orders/${orderId}`),
};


export const kitchenService = {
  getKitchenOrders: () => kitchenServiceClient.get<KitchenOrder[]>('/orders'),
};

