# 🔐 Cómo Asignar Roles a Usuarios

## Problema
El usuario "edwin santiago" muestra "Usuario" en lugar de su rol real (ADMIN o KITCHEN).

## Solución

### Paso 1: Obtener el UID del usuario
1. Abre la consola del navegador (F12)
2. Ve a la página de gestión de usuarios
3. Busca en la consola el log que dice `USER_ROW` - ahí verás el objeto del usuario con su `uid`
4. Copia el UID del usuario

**Alternativa:** Ve a [Firebase Console](https://console.firebase.google.com/) > Authentication > Users y copia el UID desde ahí.

### Paso 2: Asegurar que el servicio firebase-admin-api esté corriendo

```powershell
cd restaurant-backend
docker-compose up firebase-admin-api
```

O si no usas Docker:
```powershell
cd restaurant-backend/firebase-admin-api
npm start
```

### Paso 3: Asignar el rol

**Para asignar rol de ADMIN:**
```powershell
cd restaurant-backend/firebase-admin-api
.\set-admin-role.ps1 <UID_DEL_USUARIO>
```

**Para asignar rol de KITCHEN (Cocinero):**
```powershell
cd restaurant-backend/firebase-admin-api
.\set-kitchen-role.ps1 <UID_DEL_USUARIO>
```

### Ejemplo Completo:
```powershell
# Si el UID es: abc123xyz789
cd restaurant-backend/firebase-admin-api
.\set-admin-role.ps1 abc123xyz789
```

### Paso 4: Recargar la página
Después de asignar el rol, recarga la página del frontend. El usuario ahora debería mostrar su rol correctamente.

## Roles Disponibles
- **ADMIN** (Administrador): Acceso completo al sistema
- **KITCHEN** (Cocina/Cocinero): Acceso a funciones de cocina

## Verificación
1. Después de asignar el rol, deberías ver una respuesta exitosa en la terminal
2. Recarga la página de gestión de usuarios en el frontend
3. El rol debería aparecer en la columna "ROL"

## Troubleshooting

### Error: "No se puede conectar al servicio"
- Verifica que el servicio `firebase-admin-api` esté corriendo
- Verifica que el puerto 4001 esté disponible
- Revisa el archivo `.env` en `firebase-admin-api`

### Error: "API Key inválida"
- Verifica que el archivo `.env` tenga configurado `API_KEY`
- Por defecto es `dev-key`

### El rol no se muestra después de asignarlo
- Asegúrate de recargar la página (F5)
- Cierra sesión y vuelve a iniciar sesión
- Revisa la consola del navegador para ver si hay errores

## Configuración de Variables de Entorno

En el frontend (`restaurant-frontend/.env`):
```bash
VITE_ADMIN_API_URL=http://localhost:4001
```

En el backend admin API (`restaurant-backend/firebase-admin-api/.env`):
```bash
API_URL=http://localhost:4001
API_KEY=dev-key
SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
```
