const PORT = process.env.PORT || 3003;

// TODO: Configurar RabbitMQ para consumir order.created y order.ready
// TODO: Implementar lógica de notificaciones

console.log(`🔔 Notification Service iniciando en puerto ${PORT}`);

// Health check básico (este servicio no tiene HTTP, solo consume RabbitMQ)
// TODO: Implementar consumo de eventos y logs de notificaciones

