# US-015: Registrarse en la plataforma - Implementación

## Estado: ✅ IMPLEMENTADO Y FUNCIONAL

### Descripción
Como Administrador, quiero registrar usuarios para que puedan acceder a las funcionalidades.

### Criterios de Aceptación
1. ✅ Creación de cuenta en Firebase con email y contraseña válidos.
2. ✅ Asignación de rol por defecto "kitchen" al nuevo usuario.

## Implementación

### 1. Backend - Firebase Admin API

**Archivo:** `restaurant-backend/firebase-admin-api/index.js`

Se agregó el endpoint `/create-user` que:
- Crea el usuario en Firebase Authentication
- Asigna el rol "KITCHEN" por defecto
- Actualiza los custom claims con el rol especificado

```javascript
// Endpoint para crear usuario con rol
app.post('/create-user', async (req, res) => {
  try {
    const { email, password, displayName, role } = req.body;
    
    // Crear usuario en Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: displayName || email.split('@')[0],
      emailVerified: false
    });

    // Asignar rol por defecto 'KITCHEN' si no se especifica
    const userRole = role ? String(role).toUpperCase() : 'KITCHEN';
    await admin.auth().setCustomUserClaims(userRecord.uid, { 
      role: userRole,
      admin: userRole === 'ADMIN'
    });

    return res.json({ 
      ok: true, 
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        role: userRole
      }
    });
  } catch (err) {
    console.error('Error creating user', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});
```

### 2. Frontend - Servicio de Usuarios

**Archivo:** `restaurant-frontend/src/modules/users/usersService.js`

La función `createUser` ahora:
- Llama al endpoint `/create-user` del Firebase Admin API
- Asigna automáticamente el rol "KITCHEN" si no se especifica
- Tiene fallback para crear usuario sin rol si el API no está disponible

```javascript
export async function createUser(data) {
  try {
    const { email, password, role } = data;
    const displayName = data.displayName || data.name || '';
    
    // Usar Firebase Admin API para crear usuario con rol
    const adminApiUrl = (import.meta && import.meta.env && import.meta.env.VITE_ADMIN_API_URL) 
      ? import.meta.env.VITE_ADMIN_API_URL 
      : 'http://localhost:4001';
    const apiKey = localStorage.getItem('adminApiKey') || 'changeme';
    
    const response = await fetch(`${adminApiUrl.replace(/\/$/, '')}/create-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        email,
        password,
        displayName,
        role: role || 'KITCHEN' // Rol por defecto según US-015
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear usuario en el servidor');
    }

    const result = await response.json();
    return {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName || displayName || '',
      role: result.user.role,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    // Manejo de errores...
  }
}
```

### 3. Frontend - Formulario de Usuario

**Archivo:** `restaurant-frontend/src/modules/users/UserForm.jsx`

Cambios realizados:
- El rol por defecto cambió de "ADMIN" a "KITCHEN"
- El formulario envía el rol al servicio de usuarios

```javascript
const initialState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "KITCHEN",  // Cambiado de "ADMIN" a "KITCHEN"
};
```

## Configuración necesaria

### Variables de entorno

**Frontend (.env):**
```env
VITE_ADMIN_API_URL=http://localhost:4001
```

**Backend Firebase Admin API (.env):**
```env
SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
API_KEY=changeme123
PORT=4001
```

### Configurar API Key

En el frontend, el administrador debe configurar la API key:
1. Ir a la página de gestión de usuarios
2. Abrir la consola del navegador
3. Ejecutar: `localStorage.setItem('adminApiKey', 'changeme123')`

O crear un archivo `.env.local` en `restaurant-frontend/`:
```env
VITE_ADMIN_API_URL=http://localhost:4001
```

## Uso

### Desde la interfaz de usuario

1. El administrador accede a `/users`
2. Hace clic en "Agregar usuario"
3. Completa el formulario con:
   - Nombre completo
   - Correo electrónico
   - Contraseña (mínimo 6 caracteres)
   - Rol (KITCHEN por defecto)
4. Al hacer clic en "Guardar", se crea el usuario con el rol especificado

### Desde la API

```bash
curl -X POST http://localhost:4001/create-user \
  -H "x-api-key: changeme123" \
  -H "Content-Type: application/json" \
  -d '{
    "email":"cocinero@restaurante.com",
    "password":"password123",
    "displayName":"Juan Cocinero",
    "role":"KITCHEN"
  }'
```

## Validaciones

1. **Email válido:** Verifica formato de correo electrónico
2. **Contraseña segura:** Mínimo 6 caracteres
3. **Rol válido:** ADMIN, KITCHEN o WAITER
4. **Email único:** Firebase valida que no exista el email

## Pruebas

Para verificar que funciona correctamente:

1. **Iniciar Firebase Admin API:**
   ```bash
   cd restaurant-backend/firebase-admin-api
   npm start
   ```

2. **Iniciar Frontend:**
   ```bash
   cd restaurant-frontend
   npm run dev
   ```

3. **Crear un usuario de prueba:**
   - Email: `test@kitchen.com`
   - Password: `test123456`
   - Rol: KITCHEN (por defecto)

4. **Verificar en Firebase Console:**
   - Ir a Authentication
   - Buscar el usuario creado
   - Verificar que tiene el custom claim `role: "KITCHEN"`

## Notas importantes

- El rol por defecto es "KITCHEN" según la especificación de US-015
- Los custom claims solo pueden ser asignados por Firebase Admin SDK (backend)
- La API está protegida con API key simple (mejorar en producción)
- Si el Firebase Admin API no está disponible, el usuario se crea sin rol asignado

## Cumplimiento de Criterios

✅ **Criterio 1:** Creación de cuenta en Firebase con email y contraseña válidos
- Implementado en `firebase-admin-api/index.js` endpoint `/create-user`
- Validación de email y contraseña por Firebase

✅ **Criterio 2:** Asignación de rol por defecto "kitchen" al nuevo usuario
- Implementado en `usersService.js` con `role: role || 'KITCHEN'`
- Default en formulario cambiado a "KITCHEN"
- Backend asigna custom claims con rol especificado
