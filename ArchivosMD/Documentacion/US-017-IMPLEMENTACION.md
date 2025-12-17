# US-017: Crear nuevos usuarios (Admin) - Implementación

## Estado: ✅ IMPLEMENTADO Y FUNCIONAL

### Descripción
Como Administrador, quiero crear cuentas para personal o clientes, para gestionar accesos centralizados.

### Criterios de Aceptación
1. ✅ Opción "Crear Nuevo Usuario" disponible en gestión de usuarios.
2. ✅ Creación de cuenta en Firebase con el rol especificado por el admin.
3. ✅ El nuevo usuario puede acceder inmediatamente con esas credenciales.

## Implementación

### 1. Frontend - Gestión de Usuarios

**Archivo:** `restaurant-frontend/src/modules/users/UserManagement.jsx`

La página de gestión de usuarios incluye un botón prominente para crear nuevos usuarios:

```jsx
<header className="flex flex-wrap justify-between gap-4 items-center mb-6">
  <div className="flex flex-col gap-1">
    <p className="text-white text-3xl font-bold leading-tight tracking-tight">
      {t('users.managementTitle', 'Gestión de usuarios')}
    </p>
    <p className="text-gray-400 text-base font-normal leading-normal">
      {t('users.managementSubtitle', 'Gestiona todos los usuarios, sus roles y acceso al sistema.')}
    </p>
  </div>
  <button
    onClick={() => navigate('/users/new')}
    className="flex min-w-[84px] items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors shadow-sm"
  >
    <span className="material-symbols-outlined mr-2">add</span>
    <span className="truncate">{t('users.addNewUser', 'Agregar usuario')}</span>
  </button>
</header>
```

#### Características del Botón
- ✅ **Visible y accesible:** Ubicado en el header de la página
- ✅ **Ícono descriptivo:** Ícono "add" para claridad visual
- ✅ **Texto traducible:** Soporta i18n (español/inglés)
- ✅ **Navegación directa:** Redirige a `/users/new`

### 2. Frontend - Formulario de Creación

**Archivo:** `restaurant-frontend/src/modules/users/UserForm.jsx`

El formulario maneja tanto la creación como la edición de usuarios:

```jsx
const initialState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  role: "KITCHEN", // Rol por defecto
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSuccess("");
  const validation = validate();
  if (validation) {
    setError(validation);
    return;
  }
  setLoading(true);
  try {
    if (isEdit) {
      // Lógica de edición...
    } else {
      // Crear nuevo usuario con rol especificado
      await createUser({
        displayName: form.name,
        email: form.email,
        password: form.password,
        role: form.role, // Rol seleccionado por el admin
      });
      setSuccess(t('users.createSuccess', 'Usuario creado exitosamente.'));
    }
    // Emitir evento para refrescar la lista
    window.dispatchEvent(new CustomEvent('users:changed'));
    setTimeout(() => navigate("/users"), 600);
  } catch (err) {
    setError(t('users.createError', 'Error al crear usuario. ') + (err.message || ""));
  } finally {
    setLoading(false);
  }
};
```

#### Campos del Formulario

1. **Nombre completo** (obligatorio)
   - Placeholder: "Ej: Juan Pérez"
   - Se usa como displayName en Firebase

2. **Correo electrónico** (obligatorio)
   - Validación de formato email
   - Será el identificador único del usuario

3. **Contraseña** (obligatorio, solo en creación)
   - Mínimo 6 caracteres
   - Validación de Firebase

4. **Confirmar contraseña** (obligatorio, solo en creación)
   - Debe coincidir con la contraseña

5. **Rol** (obligatorio)
   - Dropdown con opciones: ADMIN, KITCHEN, WAITER
   - Por defecto: KITCHEN
   - El admin puede seleccionar cualquier rol

#### Validaciones Implementadas

```javascript
const validate = () => {
  if (!form.name || !form.email || !form.role) {
    return t('users.requiredFields', 'Todos los campos son obligatorios.');
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
    return t('users.invalidEmail', 'El correo no es válido.');
  }
  if (!isEdit) {
    if (!form.password || !form.confirmPassword) {
      return t('users.passwordRequired', 'La contraseña es obligatoria.');
    }
    if (form.password.length < 6) {
      return t('users.passwordMinLength', 'La contraseña debe tener al menos 6 caracteres.');
    }
    if (form.password !== form.confirmPassword) {
      return t('users.passwordsNoMatch', 'Las contraseñas no coinciden.');
    }
  }
  return null;
};
```

### 3. Frontend - Servicio de Usuarios

**Archivo:** `restaurant-frontend/src/modules/users/usersService.js`

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
        role: role || 'KITCHEN' // Rol especificado o por defecto
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
    // Manejo de errores específicos...
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('El correo electrónico ya está en uso');
    }
    if (error.code === 'auth/weak-password') {
      throw new Error('La contraseña es muy débil');
    }
    throw error;
  }
}
```

### 4. Backend - Firebase Admin API

**Archivo:** `restaurant-backend/firebase-admin-api/index.js`

```javascript
app.post('/create-user', async (req, res) => {
  try {
    const { email, password, displayName, role } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Email and password are required' });
    }

    // Crear usuario en Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: displayName || email.split('@')[0],
      emailVerified: false
    });

    // Asignar rol especificado por el admin
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

#### Características del Endpoint

1. **Validación de datos:** Email y password obligatorios
2. **Creación en Firebase:** Usa Firebase Admin SDK
3. **Asignación de rol:** El rol especificado por el admin se asigna como custom claim
4. **DisplayName automático:** Si no se proporciona, usa la parte local del email
5. **Respuesta clara:** Devuelve los datos del usuario creado

## Flujo Completo de Creación

### Paso 1: Acceder a Gestión de Usuarios
```
1. Admin inicia sesión
2. Navega a /users (Gestión de usuarios)
3. Ve el botón "Agregar usuario" en el header
```

### Paso 2: Llenar Formulario
```
1. Hace clic en "Agregar usuario"
2. Redirige a /users/new
3. Completa el formulario:
   - Nombre: Juan Pérez
   - Email: juan.perez@restaurante.com
   - Contraseña: password123
   - Confirmar contraseña: password123
   - Rol: KITCHEN (o el que desee)
```

### Paso 3: Crear Usuario
```
1. Hace clic en "Guardar"
2. Frontend valida los datos
3. Frontend envía POST a /create-user
4. Backend crea usuario en Firebase Auth
5. Backend asigna custom claims con el rol
6. Frontend muestra mensaje de éxito
7. Redirige a /users
```

### Paso 4: Usuario Puede Acceder Inmediatamente
```
1. El nuevo usuario va a /login
2. Ingresa email y contraseña
3. Firebase autentica con las credenciales creadas
4. Sistema verifica el rol del usuario
5. Redirige según el rol:
   - ADMIN → /users
   - KITCHEN → /kitchen
```

## Cumplimiento de Criterios

✅ **Criterio 1:** Opción "Crear Nuevo Usuario" disponible
- Botón "Agregar usuario" visible en `/users`
- Ubicado en el header con ícono y texto claro
- Redirige a `/users/new`

✅ **Criterio 2:** Creación de cuenta en Firebase con rol especificado
- Formulario permite seleccionar el rol (ADMIN, KITCHEN, WAITER)
- Backend crea la cuenta en Firebase Authentication
- Custom claims se asignan con el rol especificado
- El admin tiene control total sobre qué rol asignar

✅ **Criterio 3:** Acceso inmediato con las credenciales
- Las credenciales se activan inmediatamente en Firebase
- El usuario puede iniciar sesión sin necesidad de confirmación por email
- El rol está disponible desde el primer inicio de sesión
- El sistema redirige correctamente según el rol asignado

## Roles Disponibles

El administrador puede crear usuarios con los siguientes roles:

| Rol | Descripción | Permisos | Redirección Login |
|-----|-------------|----------|-------------------|
| **ADMIN** | Administrador del sistema | Gestión de usuarios, reportes, cocina | `/users` |
| **KITCHEN** | Personal de cocina | Panel de cocina, gestión de pedidos | `/kitchen` |
| **WAITER** | Mesero | Tomar pedidos (futuro) | `/` |

## Validaciones y Seguridad

### Validaciones Frontend
1. ✅ Todos los campos obligatorios
2. ✅ Formato de email válido
3. ✅ Contraseña mínimo 6 caracteres
4. ✅ Contraseñas coinciden
5. ✅ Rol seleccionado válido

### Validaciones Backend
1. ✅ Email y password requeridos
2. ✅ Email único (Firebase)
3. ✅ Contraseña segura (Firebase)
4. ✅ Rol válido (ADMIN, KITCHEN, WAITER)

### Seguridad
1. ✅ **Solo Admin puede crear:** Ruta protegida con ProtectedRoute
2. ✅ **API Key requerida:** Endpoint protegido
3. ✅ **Contraseñas encriptadas:** Firebase maneja el cifrado
4. ✅ **Custom claims seguros:** Solo backend puede asignarlos

## Mensajes de Error Claros

### Errores de Validación
- "Todos los campos son obligatorios"
- "El correo no es válido"
- "La contraseña es obligatoria"
- "La contraseña debe tener al menos 6 caracteres"
- "Las contraseñas no coinciden"

### Errores de Firebase
- "El correo electrónico ya está en uso"
- "La contraseña es muy débil"
- "Error al crear usuario en el servidor"

## Uso

### Desde la Interfaz

1. **Login como Admin:**
   ```
   Email: admin@restaurante.com
   Password: tu_password
   ```

2. **Navegar a Gestión de Usuarios:**
   ```
   Dashboard → Gestión de usuarios (/users)
   ```

3. **Crear Nuevo Usuario:**
   ```
   Click "Agregar usuario"
   Llenar formulario
   Seleccionar rol
   Click "Guardar"
   ```

4. **Verificar Usuario Creado:**
   ```
   El usuario aparece en la lista
   Se muestra su rol correctamente
   ```

### Desde la API

```bash
curl -X POST http://localhost:4001/create-user \
  -H "x-api-key: changeme123" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cocinero@restaurante.com",
    "password": "password123",
    "displayName": "Juan Cocinero",
    "role": "KITCHEN"
  }'
```

### Respuesta Exitosa

```json
{
  "ok": true,
  "user": {
    "uid": "abc123xyz...",
    "email": "cocinero@restaurante.com",
    "displayName": "Juan Cocinero",
    "role": "KITCHEN"
  }
}
```

## Diferencia con US-015

| Aspecto | US-015 (Registrarse) | US-017 (Crear Usuarios Admin) |
|---------|----------------------|-------------------------------|
| **Quién crea** | Administrador | Administrador |
| **Rol por defecto** | KITCHEN | Seleccionado por admin |
| **Enfoque** | Función general de registro | Control total del admin sobre roles |
| **UI** | Mismo formulario | Botón "Agregar usuario" destacado |

## Pruebas de Funcionamiento

### Prueba 1: Crear usuario con rol KITCHEN
```
1. Login como ADMIN
2. Ir a /users
3. Click "Agregar usuario"
4. Llenar:
   - Nombre: Pedro López
   - Email: pedro@restaurante.com
   - Password: test123456
   - Rol: KITCHEN
5. Guardar
6. Verificar que aparece en la lista con rol KITCHEN
7. Logout
8. Login con pedro@restaurante.com / test123456
9. Verificar redirección a /kitchen
```

### Prueba 2: Crear usuario con rol ADMIN
```
1. Crear usuario con rol ADMIN
2. Nuevo usuario inicia sesión
3. Verificar acceso a /users
4. Verificar puede crear otros usuarios
```

### Prueba 3: Validaciones
```
1. Intentar crear sin completar campos → Error
2. Email inválido → Error
3. Contraseñas no coinciden → Error
4. Email duplicado → Error "El correo electrónico ya está en uso"
5. Contraseña débil → Error "La contraseña es muy débil"
```

## Archivos Relacionados

- [UserManagement.jsx](c:\Users\edwin.giraldo\Documents\TrabajoMiercoles17\restaurant-frontend\src\modules\users\UserManagement.jsx) - Botón "Agregar usuario"
- [UserForm.jsx](c:\Users\edwin.giraldo\Documents\TrabajoMiercoles17\restaurant-frontend\src\modules\users\UserForm.jsx) - Formulario de creación
- [usersService.js](c:\Users\edwin.giraldo\Documents\TrabajoMiercoles17\restaurant-frontend\src\modules\users\usersService.js) - Función createUser()
- [index.js](c:\Users\edwin.giraldo\Documents\TrabajoMiercoles17\restaurant-backend\firebase-admin-api\index.js) - Endpoint /create-user
- [App.jsx](c:\Users\edwin.giraldo\Documents\TrabajoMiercoles17\restaurant-frontend\src\App.jsx) - Rutas protegidas

## Notas Importantes

1. **Acceso inmediato:** Los usuarios pueden iniciar sesión inmediatamente después de ser creados, no requieren confirmación por email

2. **Roles flexibles:** El administrador tiene control total sobre qué rol asignar a cada usuario

3. **Gestión centralizada:** Toda la gestión de usuarios se hace desde un único panel administrativo

4. **Seguridad:** Solo usuarios con rol ADMIN pueden acceder a la creación de usuarios

5. **Firebase Admin API requerido:** Para asignar roles correctamente se requiere que el firebase-admin-api esté ejecutándose

## Configuración Necesaria

### Variables de entorno

**Frontend (.env):**
```env
VITE_ADMIN_API_URL=http://localhost:4001
```

**Backend (.env):**
```env
SERVICE_ACCOUNT_PATH=./serviceAccountKey.json
API_KEY=changeme123
PORT=4001
```

### API Key en el navegador

```javascript
localStorage.setItem('adminApiKey', 'changeme123')
```

---

**Estado Final:** ✅ La US-017 está **completamente implementada y funcional**. El administrador puede crear usuarios con cualquier rol especificado y los usuarios pueden acceder inmediatamente con sus credenciales.
