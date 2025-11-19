import { KitchenService } from '../src/services/kitchenService';

describe('Kitchen Service', () => {
  let kitchenService: KitchenService;

  beforeEach(() => {
    kitchenService = new KitchenService();
  });

  test('debería procesar pedido recibido', async () => {
    // TODO: Implementar test
    // await kitchenService.processOrder({ orderId: '123', items: ['pizza'] });
    // Verificar que pedido se marca como "cooking"
  });
});

