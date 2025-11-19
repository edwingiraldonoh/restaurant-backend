import { OrderService } from '../src/services/orderService';

describe('Order Service', () => {
  let orderService: OrderService;

  beforeEach(() => {
    orderService = new OrderService();
  });

  test('debería crear pedido y publicar evento', async () => {
    // TODO: Implementar test
    // const order = await orderService.create({ items: ['pizza'] });
    // expect(order.status).toBe('pending');
  });
});

