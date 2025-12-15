# Hallazgos As Is

1. **Estados de pedidos**
   - Diferencias en los nombres y uso de estados entre Order Service (`pending`, `preparing`, `ready`) y Kitchen Service (`RECEIVED`, `PREPARING`, `READY`). No queda claro si hay un mapeo directo o si pueden desincronizarse.

2. **Endpoints internos vs. externos**
   - Algunos endpoints de Kitchen Service y Order Service son “internos”, pero no se especifica si requieren autenticación o si pueden ser accedidos por cualquier usuario.

3. **Notificaciones**
   - No se detalla el formato exacto de las notificaciones enviadas por SSE ni cómo el frontend debe manejarlas.

4. **Errores y validaciones**
   - No se especifica cómo se manejan los errores en los endpoints ni qué validaciones se aplican a los datos de entrada.

5. **Variables de entorno**
   - No hay un archivo de ejemplo ni una lista clara de variables de entorno necesarias para cada servicio.

6. **Pruebas automáticas**
   - Se menciona testing, pero no se especifica el alcance, cobertura ni cómo deben estructurarse los tests.

7. **Dependencias entre servicios**
   - No queda claro qué ocurre si un servicio (por ejemplo, Notification Service) no está disponible o falla RabbitMQ.

8. **Consistencia de datos**
   - No se explica cómo se asegura la consistencia entre los estados de los pedidos en los diferentes servicios y bases de datos.

9. **Escalabilidad**
   - No se menciona cómo escalar los servicios ni si hay limitaciones conocidas.

10. **Autorización y autenticación**
    - No se especifica si hay roles, permisos o autenticación para los endpoints administrativos o internos.