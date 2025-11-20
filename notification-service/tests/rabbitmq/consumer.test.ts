import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import * as amqp from 'amqplib/callback_api';
import { OrderEvent } from '../../src/types';

// Mock de amqplib
jest.mock('amqplib/callback_api');

// Mock de notificationService
const mockHandleOrderEvent = jest.fn();
jest.mock('../../src/services/notificationService', () => ({
    default: {
        handleOrderEvent: mockHandleOrderEvent,
    },
}));

describe('RabbitMQ Consumer', () => {
    let mockConnection: any;
    let mockChannel: any;
    let consumerCallback: (msg: any) => void;  // ✅ FIX: Tipar explícitamente
    let messageHandler: Function;

    beforeEach(() => {
        jest.clearAllMocks();

        // Mock del canal
        mockChannel = {
            assertExchange: jest.fn((exchange: string, type: string, options: any, callback: (err: Error | null) => void) => {  // ✅ FIX
                callback(null);
            }),
            assertQueue: jest.fn((queue: string, options: any, callback: (err: Error | null) => void) => {  // ✅ FIX
                callback(null);
            }),
            bindQueue: jest.fn((queue: string, exchange: string, routingKey: string, options: any, callback: (err: Error | null) => void) => {  // ✅ FIX
                callback(null);
            }),
            consume: jest.fn((queue: string, handler: (msg: any) => void, options: any, callback: (err: Error | null) => void) => {  // ✅ FIX
                consumerCallback = handler;
                callback(null);
            }),
            ack: jest.fn(),
            close: jest.fn((callback?: () => void) => callback && callback()),  // ✅ FIX
        };

        // Mock de la conexión
        mockConnection = {
            createChannel: jest.fn((callback: (err: Error | null, channel: any) => void) => {  // ✅ FIX
                callback(null, mockChannel);
            }),
            close: jest.fn((callback?: () => void) => callback && callback()),  // ✅ FIX
        };

        // Mock de amqp.connect
        (amqp.connect as any).mockImplementation((url: string, callback: (err: Error | null, conn: any) => void) => {
            callback(null, mockConnection);
        });
    });

    describe('connect', () => {
        it('debe conectarse a RabbitMQ exitosamente', async () => {
            jest.isolateModules(() => {
                const consumer = require('../../src/rabbitmq/consumer').default;

                return consumer.connect().then(() => {
                    expect(amqp.connect).toHaveBeenCalled();
                    expect(mockConnection.createChannel).toHaveBeenCalled();
                });
            });
        });

        it('debe configurar exchange tipo topic', async () => {
            jest.isolateModules(() => {
                const consumer = require('../../src/rabbitmq/consumer').default;

                return consumer.connect().then(() => {
                    expect(mockChannel.assertExchange).toHaveBeenCalledWith(
                        'orders',
                        'topic',
                        { durable: true },
                        expect.any(Function)
                    );
                });
            });
        });

        it('debe crear queue "notifications" durable', async () => {
            jest.isolateModules(() => {
                const consumer = require('../../src/rabbitmq/consumer').default;

                return consumer.connect().then(() => {
                    expect(mockChannel.assertQueue).toHaveBeenCalledWith(
                        'notifications',
                        { durable: true },
                        expect.any(Function)
                    );
                });
            });
        });

        it('debe hacer binding para order.created', async () => {
            jest.isolateModules(() => {
                const consumer = require('../../src/rabbitmq/consumer').default;

                return consumer.connect().then(() => {
                    expect(mockChannel.bindQueue).toHaveBeenCalledWith(
                        'notifications',
                        'orders',
                        'order.created',
                        {},
                        expect.any(Function)
                    );
                });
            });
        });

        it('debe hacer binding para order.ready', async () => {
            jest.isolateModules(() => {
                const consumer = require('../../src/rabbitmq/consumer').default;

                return consumer.connect().then(() => {
                    expect(mockChannel.bindQueue).toHaveBeenCalledWith(
                        'notifications',
                        'orders',
                        'order.ready',
                        {},
                        expect.any(Function)
                    );
                });
            });
        });

        it('debe iniciar consumo de mensajes', async () => {
            jest.isolateModules(() => {
                const consumer = require('../../src/rabbitmq/consumer').default;

                return consumer.connect().then(() => {
                    expect(mockChannel.consume).toHaveBeenCalledWith(
                        'notifications',
                        expect.any(Function),
                        {},
                        expect.any(Function)
                    );
                });
            });
        });
    });

    describe('handleMessage', () => {
        beforeEach(() => {
            jest.spyOn(console, 'log').mockImplementation(() => { });  // ✅ FIX
            jest.spyOn(console, 'error').mockImplementation(() => { });  // ✅ FIX
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('debe procesar mensaje order.created correctamente', async () => {
            await jest.isolateModules(async () => {
                const consumer = require('../../src/rabbitmq/consumer').default;
                await consumer.connect();

                const event: OrderEvent = {
                    orderId: 'TEST123',
                    type: 'order.created',
                    timestamp: new Date(),
                };

                const mockMessage = {
                    content: Buffer.from(JSON.stringify(event)),
                };

                consumerCallback(mockMessage);

                expect(mockHandleOrderEvent).toHaveBeenCalledWith(
                    expect.objectContaining({
                        orderId: 'TEST123',
                        type: 'order.created',
                    })
                );
                expect(mockChannel.ack).toHaveBeenCalledWith(mockMessage);
            });
        });

        it('debe procesar mensaje order.ready correctamente', async () => {
            await jest.isolateModules(async () => {
                const consumer = require('../../src/rabbitmq/consumer').default;
                await consumer.connect();

                const event: OrderEvent = {
                    orderId: 'ORDER456',
                    type: 'order.ready',
                    timestamp: new Date(),
                };

                const mockMessage = {
                    content: Buffer.from(JSON.stringify(event)),
                };

                consumerCallback(mockMessage);

                expect(mockHandleOrderEvent).toHaveBeenCalledWith(
                    expect.objectContaining({
                        orderId: 'ORDER456',
                        type: 'order.ready',
                    })
                );
            });
        });

        it('debe hacer ACK después de procesar mensaje', async () => {
            await jest.isolateModules(async () => {
                const consumer = require('../../src/rabbitmq/consumer').default;
                await consumer.connect();

                const mockMessage = {
                    content: Buffer.from(JSON.stringify({
                        orderId: 'TEST',
                        type: 'order.created',
                        timestamp: new Date(),
                    })),
                };

                consumerCallback(mockMessage);

                expect(mockChannel.ack).toHaveBeenCalledWith(mockMessage);
            });
        });

        it('debe manejar JSON inválido sin crashear', async () => {
            await jest.isolateModules(async () => {
                const consumer = require('../../src/rabbitmq/consumer').default;
                await consumer.connect();

                const mockMessage = {
                    content: Buffer.from('invalid json {{{'),
                };

                expect(() => consumerCallback(mockMessage)).not.toThrow();

                expect(mockChannel.ack).toHaveBeenCalledWith(mockMessage);
            });
        });

        it('debe ignorar mensajes null', async () => {
            await jest.isolateModules(async () => {
                const consumer = require('../../src/rabbitmq/consumer').default;
                await consumer.connect();

                consumerCallback(null);

                expect(mockHandleOrderEvent).not.toHaveBeenCalled();
                expect(mockChannel.ack).not.toHaveBeenCalled();
            });
        });
    });

    describe('retry mechanism', () => {
        it('debe reintentar conexión si falla la primera vez', async () => {
            let attempts = 0;
            (amqp.connect as any).mockImplementation((url: string, callback: (err: Error | null, conn: any) => void) => {  // ✅ FIX
                attempts++;
                if (attempts === 1) {
                    callback(new Error('Connection failed'), null as any);
                } else {
                    callback(null, mockConnection);
                }
            });

            await jest.isolateModules(async () => {
                const consumer = require('../../src/rabbitmq/consumer').default;
                await consumer.connect();

                expect(amqp.connect).toHaveBeenCalledTimes(2);
            });
        });

        it('debe lanzar error después de máximos reintentos', async () => {
            (amqp.connect as any).mockImplementation((url: string, callback: (err: Error | null, conn: any) => void) => {
                callback(new Error('Connection failed'), null as any);
            });

            await jest.isolateModules(async () => {
                const consumer = require('../../src/rabbitmq/consumer').default;

                await expect(consumer.connect()).rejects.toThrow(
                    'No se pudo conectar a RabbitMQ después de varios intentos'
                );
            });
        });
    });

    describe('close', () => {
        it('debe cerrar canal y conexión correctamente', async () => {
            await jest.isolateModules(async () => {
                const consumer = require('../../src/rabbitmq/consumer').default;
                await consumer.connect();
                await consumer.close();

                expect(mockChannel.close).toHaveBeenCalled();
                expect(mockConnection.close).toHaveBeenCalled();
            });
        });
    });
});