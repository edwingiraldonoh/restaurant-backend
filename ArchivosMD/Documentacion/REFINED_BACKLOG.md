# REFINED_BACKLOG
**Documento de Historias de Usuario Refinadas**
**Proyecto:** Delicious Kitchen

---

## US-001: Visualizar menú y tiempos de carga
[cite_start]**Descripción:** Como Cliente, quiero ver el menú con las categorías cargadas de forma prioritaria, para minimizar mi tiempo de espera antes de poder seleccionar un producto[cite: 2062].

**Criterios de Aceptación:**
1. [cite_start]**Rendimiento (LCP):** El renderizado del listado no debe exceder los 2.5 segundos en red 4G simulada[cite: 2064].
2. [cite_start]**Paginación:** Implementar Lazy Loading para categorías con >20 productos; payload inicial <500KB[cite: 2065].
3. [cite_start]**UI:** Cada tarjeta muestra obligatoriamente: Título, Precio ($0.00) y Botón "Añadir"[cite: 2066].

---

## US-002: Añadir productos al pedido
[cite_start]**Descripción:** Como Cliente, quiero añadir múltiples unidades de un mismo producto o diferentes productos a mi pedido, para personalizar la cantidad y variedad de mi orden[cite: 2068].

**Criterios de Aceptación:**
1. [cite_start]Al hacer clic en "añadir" varias veces, la cantidad del producto en el carrito se incrementa[cite: 2070].
2. [cite_start]Al añadir diferentes productos, ambos se muestran con sus respectivas cantidades[cite: 2071].
3. [cite_start]Al revisar el carrito, se muestra el subtotal correcto de los productos seleccionados[cite: 2072].

---

## US-003: Añadir notas personalizadas al pedido
[cite_start]**Descripción:** Como Cliente, quiero tener la opción de añadir notas específicas a mi pedido, para comunicar preferencias o restricciones dietéticas[cite: 2075].

**Criterios de Aceptación:**
1. [cite_start]El cliente puede introducir texto libre en el campo de notas[cite: 2077].
2. [cite_start]Las notas se guardan y asocian al pedido al confirmar[cite: 2078].
3. [cite_start]El personal de cocina visualiza las notas en los detalles del pedido[cite: 2079].

---

## US-004: Confirmar y enviar pedido
[cite_start]**Descripción:** Como Cliente, quiero confirmar mi pedido y enviarlo a la cocina, para iniciar el proceso de preparación[cite: 2083].

**Criterios de Aceptación:**
1. [cite_start]Al hacer clic en "Confirmar Pedido", el pedido se registra en el sistema[cite: 2085].
2. [cite_start]El Order Service recibe el pedido procesado[cite: 2086].
3. [cite_start]El Kitchen Service recibe una notificación de nuevo pedido[cite: 2087].

---

## US-005: Modificar pedido antes de preparación
[cite_start]**Descripción:** Como Cliente, quiero poder modificar mi pedido antes de que la cocina comience a prepararlo, para corregir errores a tiempo[cite: 2090].

**Criterios de Aceptación:**
1. [cite_start]La opción "Modificar Pedido" es visible solo si el pedido no está en estado "Comenzar a cocinar"[cite: 2092].
2. [cite_start]El Order Service actualiza el pedido tras guardar cambios[cite: 2094].
3. [cite_start]La cocina recibe notificación con los detalles actualizados[cite: 2095].

---

## US-006: Visualizar pedidos pendientes en panel de cocina
[cite_start]**Descripción:** Como Personal de Cocina, quiero ver una lista clara de todos los pedidos pendientes, para saber qué debo cocinar[cite: 2098].

**Criterios de Aceptación:**
1. [cite_start]Visualización de lista filtrada por estado "Pendiente"[cite: 2100].
2. [cite_start]Nuevos pedidos aparecen en la lista al actualizar la vista[cite: 2101].
3. [cite_start]Pedidos marcados como "En preparación" desaparecen de esta lista[cite: 2102].

---

## US-007: Marcar pedido como "Comenzar a cocinar"
[cite_start]**Descripción:** Como Personal de Cocina, quiero marcar un pedido como "Comenzar a cocinar", para indicar el inicio y notificar al cliente[cite: 2105].

**Criterios de Aceptación:**
1. [cite_start]El estado del pedido cambia a "En preparación" al hacer clic en el botón[cite: 2107].
2. [cite_start]El cliente recibe notificación de que su pedido está siendo preparado[cite: 2108].
3. [cite_start]La opción de "Modificar Pedido" se bloquea para el cliente[cite: 2109].

---

## US-008: Marcar pedido como "Listo"
[cite_start]**Descripción:** Como Personal de Cocina, quiero marcar un pedido como "Listo", para indicar que la comida está preparada para recogida[cite: 2113].

**Criterios de Aceptación:**
1. [cite_start]El estado cambia a "Listo" al hacer clic en el botón[cite: 2115].
2. [cite_start]El cliente recibe notificación para recoger su pedido[cite: 2116].
3. [cite_start]El estado no puede revertirse a "En preparación" o "Pendiente"[cite: 2117].

---

## US-009: Recibir notificación de pedido en preparación
[cite_start]**Descripción:** Como Cliente, quiero recibir una notificación automática cuando mi pedido comienza a prepararse[cite: 2121].

**Criterios de Aceptación:**
1. [cite_start]Recepción de notificación (pop-up/email) cuando cocina marca "Comenzar a cocinar"[cite: 2123].
2. [cite_start]El mensaje de la notificación es claro y conciso[cite: 2124].

---

## US-010: Recibir notificación de pedido listo
[cite_start]**Descripción:** Como Cliente, quiero recibir una notificación automática cuando mi pedido está listo para recoger[cite: 2128].

**Criterios de Aceptación:**
1. [cite_start]Recepción de notificación cuando cocina marca el pedido como "Listo"[cite: 2130].
2. [cite_start]El mensaje incluye instrucciones claras[cite: 2130].

---

## US-011: Kitchen Service recibe notificación de nuevo pedido
[cite_start]**Descripción:** Como Kitchen Service, quiero recibir una notificación de nuevos pedidos, para que el personal pueda verlos[cite: 2134].

**Criterios de Aceptación:**
1. [cite_start]Recepción de mensaje vía RabbitMQ cuando Order Service registra un pedido[cite: 2136].
2. [cite_start]El nuevo pedido aparece en el panel de pendientes tras procesar el mensaje[cite: 2137].

---

## US-012: Kitchen Service recibe notificación de pedido cancelado
[cite_start]**Descripción:** Como Kitchen Service, quiero recibir notificación de cancelaciones, para optimizar recursos[cite: 2140].

**Criterios de Aceptación:**
1. [cite_start]Recepción de mensaje vía RabbitMQ tras cancelación en Order Service[cite: 2142].
2. [cite_start]El pedido se elimina o marca como "Cancelado" en el panel de cocina[cite: 2143].
3. [cite_start]El personal no puede iniciar preparación de un pedido cancelado[cite: 2144].

---

## US-013: Cancelar un pedido
[cite_start]**Descripción:** Como Cliente, quiero cancelar mi pedido si aún no ha comenzado a cocinarse, para anular errores[cite: 2148].

**Criterios de Aceptación:**
1. [cite_start]Opción "Cancelar" visible solo si no se ha marcado "Comenzar a cocinar"[cite: 2150].
2. [cite_start]Order Service procesa la cancelación tras confirmación[cite: 2151].
3. [cite_start]Kitchen Service recibe la notificación y actualiza el panel[cite: 2152].

---

## US-014: Recibir confirmación de cancelación
[cite_start]**Descripción:** Como Cliente, quiero recibir notificación de cancelación exitosa[cite: 2155].

**Criterios de Aceptación:**
1. [cite_start]Recepción de notificación confirmando la cancelación y anulación de proceso[cite: 2156].

---

## US-015: Registrarse en la plataforma
[cite_start]**Descripción:** Como Usuario, quiero registrarme con una cuenta nueva para acceder a las funcionalidades[cite: 2158].

**Criterios de Aceptación:**
1. [cite_start]Creación de cuenta en Firebase con email y contraseña válidos[cite: 2161].
2. [cite_start]Asignación de rol por defecto "Cliente" al nuevo usuario[cite: 2162].

---

## US-016: Iniciar sesión con credenciales
[cite_start]**Descripción:** Como Usuario, quiero iniciar sesión para acceder a mi rol[cite: 2165].

**Criterios de Aceptación:**
1. [cite_start]Autenticación exitosa con Firebase redirige a la interfaz correspondiente al rol[cite: 2166].
2. [cite_start]Mensaje de error claro ante credenciales incorrectas[cite: 2167].

---

## US-017: Crear nuevos usuarios (Admin)
[cite_start]**Descripción:** Como Administrador, quiero crear cuentas para personal o clientes, para gestionar accesos centralizados[cite: 2171].

**Criterios de Aceptación:**
1. [cite_start]Opción "Crear Nuevo Usuario" disponible en gestión de usuarios[cite: 2173].
2. [cite_start]Creación de cuenta en Firebase con el rol especificado por el admin[cite: 2174].
3. [cite_start]El nuevo usuario puede acceder inmediatamente con esas credenciales[cite: 2175].

---

## US-018: Editar roles de usuarios (Admin)
[cite_start]**Descripción:** Como Administrador, quiero modificar roles de usuarios existentes para ajustar permisos[cite: 2178].

**Criterios de Aceptación:**
1. [cite_start]Capacidad de cambiar rol (Cliente, Cocina, Admin) desde editar perfil[cite: 2180].
2. [cite_start]Los permisos se actualizan al siguiente inicio de sesión del usuario[cite: 2181].
3. [cite_start]Error al intentar asignar roles inválidos[cite: 2182].

---

## US-019: Activar/desactivar cuentas (Admin)
[cite_start]**Descripción:** Como Administrador, quiero activar o desactivar cuentas para controlar el acceso sin borrar datos[cite: 2185].

**Criterios de Aceptación:**
1. [cite_start]Usuario desactivado no puede iniciar sesión[cite: 2187].
2. [cite_start]Usuario reactivado recupera el acceso[cite: 2188].
3. [cite_start]Mensaje de "cuenta inactiva" al intentar loguearse[cite: 2189].

---

## US-020: Visualizar roles correctamente (Admin)
[cite_start]**Descripción:** Como Administrador, quiero que los roles se muestren correctamente en el panel para evitar confusiones[cite: 2192].

**Criterios de Aceptación:**
1. [cite_start]Visualización clara del rol actual de cada usuario en la lista[cite: 2194].
2. [cite_start]Traducción correcta de nombres de roles según idioma[cite: 2195].
3. [cite_start]Reflejo inmediato en la lista tras editar un rol[cite: 2196].

---

## US-021: Mantener sesión activa
[cite_start]**Descripción:** Como Usuario, quiero que mi sesión no expire en corto tiempo para uso fluido[cite: 2199].

**Criterios de Aceptación:**
1. [cite_start]Sesión activa por 10 minutos de inactividad[cite: 2202].
2. [cite_start]Solicitud de login clara al expirar token[cite: 2203].
3. [cite_start]Configuración de token superior a 3 minutos confirmada[cite: 2204].

---

## US-022: Dejar una reseña estructurada
[cite_start]*(Sustituye a la original para garantizar seguridad y calidad de datos)* [cite: 2206]
[cite_start]**Descripción:** Como Cliente, quiero calificar y comentar un pedido finalizado, para compartir mi experiencia con la comunidad[cite: 2208].

**Criterios de Aceptación:**
1. [cite_start]**Estado:** Habilitado solo si el pedido está ENTREGADO o RECOGIDO[cite: 2210].
2. [cite_start]**Seguridad:** Campo de texto sanitizado (sin scripts) y limitado a 280 caracteres[cite: 2211].
3. [cite_start]**Datos:** Calificación obligatoria numérica entera entre 1 y 5[cite: 2212].

---

## US-023: Ver reseñas pendientes (Admin)
[cite_start]**Descripción:** Como Administrador, quiero ver reseñas pendientes para moderarlas[cite: 2215].

**Criterios de Aceptación:**
1. [cite_start]Lista de reseñas con estado "Pendiente" visible en sección de gestión[cite: 2216].
2. [cite_start]Visualización de contenido completo y detalles del cliente al abrir[cite: 2217].

---

## US-024: Aprobar u ocultar reseñas (Admin)
[cite_start]**Descripción:** Como Administrador, quiero aprobar u ocultar reseñas para controlar el contenido público[cite: 2221].

**Criterios de Aceptación:**
1. [cite_start]Acción "Aprobar" hace visible la reseña públicamente[cite: 2223].
2. [cite_start]Acción "Ocultar" retira la reseña de la vista pública[cite: 2224].
3. [cite_start]Actualización correcta del estado en la lista tras la acción[cite: 2225].

---

## US-025: Ver reseñas aprobadas
[cite_start]**Descripción:** Como Cliente, quiero ver reseñas aprobadas para informarme sobre productos[cite: 2229].

**Criterios de Aceptación:**
1. [cite_start]Solo se visualizan reseñas con estado "Aprobada"[cite: 2231].
2. [cite_start]Se muestra comentario, calificación y nombre/alias[cite: 2232].
3. [cite_start]Reseñas ocultas desaparecen de la vista al actualizar[cite: 2233].

---

## US-026: Acceder a panel de reportes (Admin)
[cite_start]**Descripción:** Como Administrador, quiero visualizar estadísticas clave del negocio en un panel central[cite: 2236].

**Criterios de Aceptación:**
1. [cite_start]Visualización de gráficos y métricas al entrar a "Reportes"[cite: 2238].
2. [cite_start]Carga de datos por defecto (ej. último mes)[cite: 2239].
3. [cite_start]Acceso denegado a usuarios sin rol de administrador[cite: 2240].

---

## US-027: Filtrar reportes por fecha (Admin)
[cite_start]**Descripción:** Como Administrador, quiero filtrar reportes por rango de fechas para análisis específico[cite: 2243].

**Criterios de Aceptación:**
1. [cite_start]Selección de "Fecha Desde" y "Fecha Hasta"[cite: 2245].
2. [cite_start]Actualización de métricas acorde al período seleccionado[cite: 2246].
3. [cite_start]Mensaje de error ante rangos inválidos[cite: 2247].

---

## US-028: Visualizar métricas financieras brutas
[cite_start]**Descripción:** Como Administrador, quiero ver el "Ingreso Total" en el dashboard, para monitorear el flujo de caja diario operativo[cite: 2249].

**Criterios de Aceptación:**
1. [cite_start]**Fórmula:** Ingreso Total = $\sum (PrecioUnitario \times Cantidad)$ (Excluyendo impuestos/envío)[cite: 2253].
2. [cite_start]**Datos:** Mostrar $0.00 si no hay ventas (no mostrar vacío/error)[cite: 2254].
3. [cite_start]**Rendimiento:** Recálculo en $\le 1000ms$ al filtrar[cite: 2255].

---

## US-029: Ver producto más destacado (Admin)
[cite_start]**Descripción:** Como Administrador, quiero identificar el producto más vendido para optimizar el menú[cite: 2258].

**Criterios de Aceptación:**
1. [cite_start]Visualización del "Producto Más Destacado" por cantidad de unidades[cite: 2260].
2. [cite_start]Actualización dinámica según el filtro de fechas[cite: 2261].
3. [cite_start]Indicación "Ninguno" o "N/A" si no hay ventas[cite: 2262].

---

## US-030: Exportar reportes a CSV estandarizado
*[REFACTORIZADA]*
[cite_start]*(Sustituye a la original para compatibilidad de datos)* [cite: 2264, 2265]
[cite_start]**Descripción:** Como Administrador, quiero descargar los datos de ventas en CSV, para importarlos en herramientas externas sin errores[cite: 2268].

**Criterios de Aceptación:**
1. [cite_start]**Codificación:** UTF-8 con BOM (para compatibilidad Excel)[cite: 2270].
2. **Formato:** Delimitador punto y coma (;). [cite_start]Encabezados obligatorios[cite: 2271].
3. [cite_start]**Archivo:** Nombre automático `reporte_ventas_YYYY-MM-DD.csv`[cite: 2272].

---

## US-031: Ver tiempo de preparación en reportes (Admin)
[cite_start]**Descripción:** Como Administrador, quiero ver el tiempo promedio de preparación para identificar cuellos de botella[cite: 2276].

**Criterios de Aceptación:**
1. [cite_start]Métrica de "Tiempo Promedio de Preparación" visible[cite: 2278].
2. [cite_start]Cálculo actualizado según rango de fechas[cite: 2279].
3. [cite_start]Indicación "N/A" si no hay pedidos completados[cite: 2280].

---

## US-032: Visualizar nombres de productos completos (Admin)
[cite_start]**Descripción:** Como Administrador, quiero ver nombres completos en reportes para lectura clara[cite: 2284].

**Criterios de Aceptación:**
1. [cite_start]Ajuste de columnas o tooltips para nombres largos[cite: 2286].
2. [cite_start]Exportación a CSV incluye nombres completos sin truncar[cite: 2287].

---

## US-033: Cambiar idioma de la interfaz
[cite_start]**Descripción:** Como Usuario, quiero cambiar entre español e inglés para usar la app en mi idioma[cite: 2290].

**Criterios de Aceptación:**
1. [cite_start]Selector de idioma permite elegir "Español" o "Inglés"[cite: 2292].
2. [cite_start]Textos, etiquetas y mensajes se actualizan al idioma elegido[cite: 2293].
3. [cite_start]Persistencia de la selección al navegar[cite: 2293].

---

## US-034: Contenerizar aplicación con Docker
[cite_start]**Descripción:** Como Desarrollador, quiero que microservicios y frontend usen Docker para facilitar despliegue[cite: 2296].

**Criterios de Aceptación:**
1. [cite_start]`docker-compose up` levanta todos los servicios correctamente[cite: 2298].
2. [cite_start]Servicios funcionan en nuevos entornos sin problemas de dependencias[cite: 2299].
3. [cite_start]Reconstrucción aislada de imágenes por servicio[cite: 2300].

---

## US-035: Comunicación asíncrona con RabbitMQ
[cite_start]**Descripción:** Como Desarrollador, quiero usar RabbitMQ entre microservicios para escalabilidad[cite: 2302].

**Criterios de Aceptación:**
1. [cite_start]Microservicios suscritos reciben eventos publicados (ej. nuevo pedido)[cite: 2305].
2. [cite_start]Recuperación y procesamiento de mensajes tras fallo temporal[cite: 2306].
3. [cite_start]Manejo de alto volumen sin degradación de comunicación[cite: 2307].

---

## US-036: Mantener estándares de calidad de código
[cite_start]**Descripción:** Como Desarrollador, quiero que el pipeline de CI/CD valide el estilo de código, para prevenir deuda técnica[cite: 2309].

**Criterios de Aceptación:**
1. [cite_start]**Linter:** Build falla si hay errores de ESLint (Standard/Airbnb)[cite: 2313].
2. [cite_start]**Complejidad:** Ninguna función con Complejidad Ciclomática > 10[cite: 2314].
3. [cite_start]**Duplicidad:** Rechazo de cambios con >5% de código duplicado[cite: 2315].

---

## US-037: Proteger contraseñas de usuario
[cite_start]**Descripción:** Como Usuario, quiero que mis contraseñas estén protegidas para garantizar seguridad[cite: 2318].

**Criterios de Aceptación:**
1. [cite_start]Transmisión segura vía HTTPS[cite: 2321].
2. [cite_start]Almacenamiento cifrado/hasheado en Firebase[cite: 2322].
3. [cite_start]Contraseñas no visibles en texto plano para administradores[cite: 2323].

---

## US-038: Alta cobertura de pruebas unitarias
[cite_start]**Descripción:** Como Desarrollador, quiero una alta cobertura de pruebas (mínimo 85%) para asegurar calidad[cite: 2326].

**Criterios de Aceptación:**
1. [cite_start]Informe de cobertura muestra al menos 85%[cite: 2328].
2. [cite_start]Detección de regresiones al ejecutar pruebas[cite: 2329].
3. [cite_start]Nuevas funcionalidades incluyen sus respectivas pruebas[cite: 2330].

---

## US-039: Manejo de errores centralizado
[cite_start]**Descripción:** Como Desarrollador, quiero manejo de errores centralizado para facilitar depuración[cite: 2333].

**Criterios de Aceptación:**
1. [cite_start]Captura de errores propagados por manejador central[cite: 2335].
2. [cite_start]Formato de respuesta de error consistente en frontend[cite: 2336].
3. [cite_start]Logs claros y útiles registrados[cite: 2337].

---

## US-040: Kitchen Service recibe notificación de modificación
[cite_start]**Descripción:** Como Kitchen Service, quiero notificación de modificaciones para evitar errores en cocina[cite: 2340].

**Criterios de Aceptación:**
1. [cite_start]Recepción de mensaje RabbitMQ con detalles actualizados[cite: 2342].
2. [cite_start]Actualización automática del pedido en panel de cocina[cite: 2343].
3. [cite_start]Visualización clara de cambios para el personal[cite: 2344].