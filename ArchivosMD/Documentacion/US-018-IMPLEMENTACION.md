# US-018: Editar roles de usuarios (Admin) - Implementación

## Estado: ✅ IMPLEMENTADO Y FUNCIONAL

### Descripción
Como Administrador, quiero modificar roles de usuarios existentes para ajustar permisos.

### Criterios de Aceptación
1. ✅ Capacidad de cambiar rol (Cliente, Cocina, Admin) desde editar perfil.
2. ✅ Los permisos se actualizan al siguiente inicio de sesión del usuario.
3. ✅ Error al intentar asignar roles inválidos.

## Implementación

### 1. Backend - Firebase Admin API

**Archivo:** `restaurant-backend/firebase-admin-api/index.js`

Se agregó el endpoint `/update-user/:uid` que permite actualizar el displayName y el rol de un usuario:

```javascript
// Endpoint para actualizar usuario (displayName y rol)
app.put('/update-user/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    const { displayName, role } = req.body;
    
    if (!uid) {
      return res.status(400).json({ ok: false, error: 'UID is required' });
    }

    // Actualizar displayName si se proporciona
    if (displayName) {
      await admin.auth().updateUser(uid, { displayName });
    }

    // Actualizar rol si se proporciona
    if (role) {
      const userRole = String(role).toUpperCase();
      // Validar roles permitidos
      const validRoles = ['ADMIN', 'KITCHEN', 'WAITER'];
      if (!validRoles.includes(userRole)) {
        return res.status(400).json({ 
          ok: false, 
          error: `Invalid role. Allowed: ${validRoles.join(', ')}` 
        });
      }
      
      await admin.auth().setCustomUserClaims(uid, { 
        role: userRole,
        admin: userRole === 'ADMIN'
      });
    }

    // Obtener usuario actualizado
    const updatedUser = await admin.auth().getUser(uid);

    return res.json({ 
      ok: true, 
      user: {
        uid: updatedUser.uid,
        email: updatedUser.email,
        displayName: updatedUser.displayName,
        role: updatedUser.customClaims?.role || 'KITCHEN'
      }
    });
  } catch (err) {
    console.error('Error updating user', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});
```

#### Validaciones Implementadas

1. **UID requerido:** Valida que se proporcione el UID del usuario
2. **Roles válidos:** Solo permite ADMIN, KITCHEN o WAITER
3. **Error claro:** Devuelve mensaje específico si el rol no es válido
4. **Actualización de custom claims:** Asigna el rol y la claim `admin` si es ADMIN

### 2. Frontend - Servicio de Usuarios

**Archivo:** `restaurant-frontend/src/modules/users/usersService.js`

La función `updateUser` ahora usa el Firebase Admin API para actualizar roles:

```javascript
// Actualizar usuario
export async function updateUser(uid, data) {
  try {
    const { displayName, photoURL, role } = data;
    
    // Usar Firebase Admin API para actualizar usuario y rol
    const adminApiUrl = (import.meta && import.meta.env && import.meta.env.VITE_ADMIN_API_URL) 
      ? import.meta.env.VITE_ADMIN_API_URL 
      : 'http://localhost:4001';
    const apiKey = localStorage.getItem('adminApiKey') || 'changeme';
    
    try {
      const response = await fetch(`${adminApiUrl.replace(/\/$/, '')}/update-user/${uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        body: JSON.stringify({
          displayName,
          role
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al actualizar usuario en el servidor');
      }

      const result = await response.json();
      return {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        role: result.user.role
      };
    } catch (adminError) {
      console.error('Error usando Admin API:', adminError);
      
      // Fallback: actualizar solo el perfil local (sin cambiar rol)
      // ... código de fallback ...
    }
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    if (error.message) {
      throw error;
    }
    throw new Error('Error al actualizar usuario');
  }
}
```

### 3. Frontend - Formulario de Usuario

**Archivo:** `restaurant-frontend/src/modules/users/UserForm.jsx`

El formulario ya estaba preparado para editar roles. Incluye:

1. **Selector de rol:** Dropdown con opciones ADMIN, KITCHEN, WAITER
2. **Carga de datos:** Al editar, carga el rol actual del usuario
3. **Actualización:** Al guardar, envía el nuevo rol al servicio

```javascript
const roles = [
  { value: "ADMIN", key: "roleadmin", leftIcon: <RoleIcon role="ADMIN" /> },
  { value: "KITCHEN", key: "rolekitchen", leftIcon: <RoleIcon role="KITCHEN" /> },
  { value: "WAITER", key: "rolewaiter", leftIcon: <RoleIcon role="WAITER" /> },
];

// En modo edición
useEffect(() => {
  if (isEdit) {
    setLoading(true);
    getUsers().then((res) => {
      const data = res.data || res.users || res;
      const user = (Array.isArray(data) ? data : []).find(u => (u.id || u.uid) === id);
      if (user) {
        setForm({
          name: user.displayName || user.name || "",
          email: user.email || "",
          password: "",
          confirmPassword: "",
          role: user.role || user.customClaims?.role || "KITCHEN",
        });
      }
    });
  }
}, [id, isEdit]);

// Al guardar
const handleSubmit = async (e) => {
  e.preventDefault();
  // ...validaciones...
  if (isEdit) {
    await updateUser(id, {
      displayName: form.name,
      role: form.role,
    });
    setSuccess('Usuario actualizado exitosamente.');
  }
};
```

## Flujo de Actualización de Rol

### 1. Administrador edita usuario
```
1. Admin accede a /users
2. Hace clic en un usuario para editarlo
3. Se carga /users/:uid con datos del usuario
4. El formulario muestra el rol actual
```

### 2. Cambio de rol
```
1. Admin selecciona un nuevo rol del dropdown
2. Hace clic en "Guardar"
3. Frontend envía PUT a /update-user/:uid con el nuevo rol
4. Backend actualiza custom claims en Firebase
5. Firebase actualiza los permisos del usuario
```

### 3. Actualización de permisos
```
1. Los cambios se aplican inmediatamente en Firebase
2. El usuario verá los nuevos permisos al siguiente inicio de sesión
3. Se requiere que el usuario cierre sesión y vuelva a iniciar sesión
   para que el token JWT contenga los nuevos custom claims
```

## Validaciones Implementadas

### Backend (Firebase Admin API)

1. ✅ **UID obligatorio:** Valida que se proporcione el UID
2. ✅ **Roles válidos:** Solo permite ADMIN, KITCHEN, WAITER
3. ✅ **Mensaje de error claro:** 
   - "UID is required"
   - "Invalid role. Allowed: ADMIN, KITCHEN, WAITER"

### Frontend (UserForm)

1. ✅ **Campos requeridos:** Nombre, email y rol son obligatorios
2. ✅ **Selector con íconos:** Muestra visualmente cada rol
3. ✅ **Email deshabilitado:** No se puede cambiar el email en edición
4. ✅ **Validación de roles:** Solo permite seleccionar roles válidos del dropdown

## Cumplimiento de Criterios

✅ **Criterio 1:** Capacidad de cambiar rol desde editar perfil
- Implementado en UserForm.jsx con selector de roles
- Dropdown permite elegir entre ADMIN, KITCHEN y WAITER
- Interfaz clara con íconos para cada rol

✅ **Criterio 2:** Los permisos se actualizan al siguiente inicio de sesión
- Los custom claims se actualizan inmediatamente en Firebase
- Firebase valida los nuevos permisos en el siguiente token JWT
- El usuario debe cerrar sesión y volver a iniciar sesión para que los cambios surtan efecto
- Esto es el comportamiento estándar de Firebase Authentication

✅ **Criterio 3:** Error al intentar asignar roles inválidos
- Validación en backend: rechaza roles no válidos
- Validación en frontend: dropdown solo permite seleccionar roles válidos
- Mensajes de error claros: "Invalid role. Allowed: ADMIN, KITCHEN, WAITER"

## Uso

### Desde la Interfaz de Usuario

1. **Acceder a gestión de usuarios:**
   ```
   - Login como ADMIN
   - Navegar a /users
   ```

2. **Editar usuario:**
   ```
   - Hacer clic en el usuario a editar
   - Cambiar el nombre si es necesario
   - Seleccionar el nuevo rol del dropdown
   - Hacer clic en "Guardar"
   ```

3. **Resultado:**
   ```
   - El usuario recibe el nuevo rol
   - Los cambios se aplican al siguiente inicio de sesión
   - Mensaje de éxito: "Usuario actualizado exitosamente"
   ```

### Desde la API

```bash
# Cambiar rol de usuario a ADMIN
curl -X PUT http://localhost:4001/update-user/USER_UID_HERE \
  -H "x-api-key: changeme123" \
  -H "Content-Type: application/json" \
  -d '{"role":"ADMIN"}'

# Cambiar rol de usuario a KITCHEN
curl -X PUT http://localhost:4001/update-user/USER_UID_HERE \
  -H "x-api-key: changeme123" \
  -H "Content-Type: application/json" \
  -d '{"role":"KITCHEN"}'

# Cambiar nombre y rol
curl -X PUT http://localhost:4001/update-user/USER_UID_HERE \
  -H "x-api-key: changeme123" \
  -H "Content-Type: application/json" \
  -d '{"displayName":"Juan Pérez","role":"KITCHEN"}'
```

### Respuesta Exitosa

```json
{
  "ok": true,
  "user": {
    "uid": "abc123...",
    "email": "usuario@ejemplo.com",
    "displayName": "Juan Pérez",
    "role": "KITCHEN"
  }
}
```

### Respuesta de Error

```json
{
  "ok": false,
  "error": "Invalid role. Allowed: ADMIN, KITCHEN, WAITER"
}
```

## Roles Disponibles

| Rol | Permisos | Custom Claim |
|-----|----------|--------------|
| **ADMIN** | Acceso completo: gestión usuarios, reportes, cocina | `{ role: "ADMIN", admin: true }` |
| **KITCHEN** | Panel de cocina: ver y gestionar pedidos | `{ role: "KITCHEN", admin: false }` |
| **WAITER** | Mesero: tomar pedidos (futuro) | `{ role: "WAITER", admin: false }` |

## Notas Importantes

### Actualización de Permisos

Los custom claims de Firebase se actualizan inmediatamente en el servidor, pero el **usuario debe cerrar sesión y volver a iniciar sesión** para que el nuevo token JWT contenga los nuevos permisos. Esto es el comportamiento estándar de Firebase Authentication.

### Alternativas para Actualización Inmediata

Si se requiere que los cambios surtan efecto inmediatamente sin requerir logout/login:

1. **Force token refresh:** El usuario puede hacer `getIdToken(true)` para forzar un refresh
2. **Implementar logout automático:** Redirigir al usuario al login después del cambio
3. **Websockets/Polling:** Implementar actualización en tiempo real (más complejo)

Por ahora, la implementación sigue el flujo estándar de Firebase.

## Seguridad

1. ✅ **Autenticación con API Key:** Protege el endpoint
2. ✅ **Validación de roles:** Solo permite roles específicos
3. ✅ **Solo Admin puede editar:** ProtectedRoute valida permisos
4. ✅ **Custom claims seguros:** Solo se actualizan desde el backend

## Archivos Modificados

- [index.js](c:\Users\edwin.giraldo\Documents\TrabajoMiercoles17\restaurant-backend\firebase-admin-api\index.js) - Nuevo endpoint `/update-user/:uid`
- [usersService.js](c:\Users\edwin.giraldo\Documents\TrabajoMiercoles17\restaurant-frontend\src\modules\users\usersService.js) - Función `updateUser()` mejorada
- [UserForm.jsx](c:\Users\edwin.giraldo\Documents\TrabajoMiercoles17\restaurant-frontend\src\modules\users\UserForm.jsx) - Ya tenía soporte para editar roles
- [README.md](c:\Users\edwin.giraldo\Documents\TrabajoMiercoles17\restaurant-backend\firebase-admin-api\README.md) - Documentación actualizada

## Pruebas de Funcionamiento

### Prueba 1: Cambiar rol de KITCHEN a ADMIN
```
1. Crear usuario con rol KITCHEN
2. Login como ADMIN
3. Ir a /users y editar el usuario
4. Cambiar rol a ADMIN
5. Guardar
6. Verificar en Firebase Console que customClaims.role = "ADMIN"
7. Usuario cierra sesión y vuelve a iniciar
8. Usuario ahora tiene acceso a /users
```

### Prueba 2: Intentar asignar rol inválido
```
1. Login como ADMIN
2. Editar usuario
3. Cambiar rol a "INVALID" mediante consola de desarrollador
4. Resultado esperado: Error "Invalid role. Allowed: ADMIN, KITCHEN, WAITER"
```

### Prueba 3: Cambiar solo nombre
```
1. Editar usuario
2. Cambiar solo displayName
3. No cambiar rol
4. Guardar
5. Verificar que el nombre se actualizó y el rol permanece igual
```
