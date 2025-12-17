# US-016: Iniciar sesión con credenciales - Implementación

## Estado: ✅ IMPLEMENTADO Y FUNCIONAL

### Descripción
Como Usuario, quiero iniciar sesión para acceder a mi rol.

### Criterios de Aceptación
1. ✅ Autenticación exitosa con Firebase redirige a la interfaz correspondiente al rol.
2. ✅ Mensaje de error claro ante credenciales incorrectas.

## Implementación

### 1. Componente de Login

**Archivo:** `restaurant-frontend/src/components/Login.jsx`

El componente implementa:
- Autenticación con Firebase usando email y password
- Validación de roles permitidos (ADMIN y KITCHEN)
- Redirección automática según el rol del usuario
- Mensajes de error claros y específicos
- Modal de recuperación de contraseña

#### Flujo de Autenticación

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    // 1. Autenticar con Firebase
    const { user, tokenResult } = await authenticateUser(email, password);
    
    // 2. Validar rol permitido
    const isAllowed = validateAllowedRole(tokenResult.claims);

    // 3. Redirigir según resultado
    if (isAllowed) {
      handleSuccessfulLogin(user, tokenResult);
    } else {
      handleUnauthorizedAccess(tokenResult.claims);
    }
  } catch (error) {
    handleAuthError(error);
  } finally {
    setLoading(false);
  }
};
```

#### Validación de Roles

```javascript
const validateAllowedRole = (claims) => {
  // Aceptar role explícito o la claim boolean `admin` desde Firebase
  const role = (claims && (claims.role || (claims.admin ? 'ADMIN' : ''))) || '';
  const roleNormalized = String(role).toUpperCase();
  return roleNormalized === "ADMIN" || roleNormalized === "KITCHEN";
};
```

#### Redirección según Rol

```javascript
const handleSuccessfulLogin = (user, tokenResult) => {
  const claims = tokenResult.claims || {};
  const resolvedRole = (claims.role ? String(claims.role) : (claims.admin ? 'ADMIN' : undefined));
  const normalizedRole = resolvedRole ? String(resolvedRole).toUpperCase() : undefined;
  
  // Guardar usuario en localStorage
  localStorage.setItem('user', JSON.stringify({ email: user.email, role: normalizedRole }));
  
  // Actualizar el estado global de autenticación
  login({
    email: user.email,
    role: normalizedRole,
    ...claims
  });
  
  // Redirigir según el rol
  if (normalizedRole === 'ADMIN') {
    navigate("/users");
  } else if (normalizedRole === 'KITCHEN') {
    navigate("/kitchen");
  } else {
    navigate("/");
  }
};
```

#### Manejo de Errores Mejorado

```javascript
const handleAuthError = (error) => {
  console.error("Authentication error:", error);
  
  // Mensajes de error claros según el tipo de error de Firebase
  let errorMessage = "Error de autenticación. Por favor intenta nuevamente.";
  
  if (error.code === 'auth/user-not-found') {
    errorMessage = "No existe una cuenta con este correo electrónico.";
  } else if (error.code === 'auth/wrong-password') {
    errorMessage = "Contraseña incorrecta. Por favor verifica tus credenciales.";
  } else if (error.code === 'auth/invalid-email') {
    errorMessage = "El formato del correo electrónico es inválido.";
  } else if (error.code === 'auth/user-disabled') {
    errorMessage = "Esta cuenta ha sido desactivada. Contacta al administrador.";
  } else if (error.code === 'auth/too-many-requests') {
    errorMessage = "Demasiados intentos fallidos. Por favor intenta más tarde.";
  } else if (error.code === 'auth/network-request-failed') {
    errorMessage = "Error de conexión. Verifica tu conexión a internet.";
  } else if (error.code === 'auth/invalid-credential') {
    errorMessage = "Credenciales inválidas. Verifica tu correo y contraseña.";
  }
  
  setError(errorMessage);
};
```

### 2. Contexto de Autenticación

**Archivo:** `restaurant-frontend/src/context/AuthContext.jsx`

Maneja el estado global de autenticación:

```javascript
export const AuthContext = createContext({
  isLoggedIn: false,
  user: null,
  login: () => {},
  logout: () => {},
});

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 3. Rutas Protegidas

**Archivo:** `restaurant-frontend/src/components/ProtectedRoute.jsx`

Protege rutas según el rol del usuario:

```javascript
function ProtectedRoute({ children, allowedRoles, requireAdmin }) {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useContext(AuthContext);

  // Si requireAdmin es true, solo permitir ADMIN
  const rolesPermitidos = requireAdmin ? ['ADMIN'] : allowedRoles;

  // Normaliza roles permitidos a mayúsculas
  const normalizedAllowedRoles = rolesPermitidos ? rolesPermitidos.map(r => r.toUpperCase()) : null;
  const userRole = (user?.role || '').toUpperCase();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
    } else if (normalizedAllowedRoles && !normalizedAllowedRoles.includes(userRole)) {
      // Redirigir al cocinero a /kitchen si intenta acceder a rutas de admin
      if (userRole === 'KITCHEN') {
        navigate('/kitchen');
      } else {
        navigate('/');
      }
    }
  }, [isLoggedIn, userRole, normalizedAllowedRoles, navigate]);

  if (!isLoggedIn) return null;
  if (normalizedAllowedRoles && !normalizedAllowedRoles.includes(userRole)) return null;
  return children;
}
```

### 4. Configuración de Rutas

**Archivo:** `restaurant-frontend/src/App.jsx`

```javascript
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/order" element={<OrderPage />} />
  <Route path="/orders/:orderId" element={<OrderStatusPage />} />
  <Route path="/login" element={<LoginWithRedirect />} />
  
  <Route element={<MainLayout />}>
    {/* Ruta para ADMIN y KITCHEN */}
    <Route path="/kitchen" element={
      <ProtectedRoute allowedRoles={["ADMIN", "KITCHEN"]}>
        <Kitchen />
      </ProtectedRoute>
    } />
    
    {/* Rutas solo para ADMIN */}
    <Route path="/dashboard/analytics" element={
      <ProtectedRoute requireAdmin={true}>
        <SalesAnalyticsDashboard />
      </ProtectedRoute>
    } />
    <Route path="/users" element={
      <ProtectedRoute requireAdmin={true}>
        <UserManagement />
      </ProtectedRoute>
    } />
  </Route>
</Routes>
```

## Funcionalidades Adicionales

### 1. Recuperación de Contraseña

El componente incluye un modal para recuperar contraseña:

```javascript
const handleForgotPassword = async (e) => {
  e.preventDefault();
  setResetError("");
  setResetMessage("");
  setResetLoading(true);

  try {
    await sendPasswordResetEmail(auth, resetEmail);
    setResetMessage("Email de recuperación enviado. Por favor revisa tu bandeja de entrada.");
    setTimeout(() => {
      setShowForgotPassword(false);
      setResetEmail("");
      setResetMessage("");
    }, 3000);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    if (error.code === 'auth/user-not-found') {
      setResetError("No existe una cuenta con este email.");
    } else if (error.code === 'auth/invalid-email') {
      setResetError("Email inválido.");
    } else {
      setResetError("Error al enviar el email de recuperación. Intenta nuevamente.");
    }
  } finally {
    setResetLoading(false);
  }
};
```

### 2. Protección de Acceso Directo

El componente verifica que el acceso a `/login` venga desde el botón Dashboard:

```javascript
useEffect(() => {
  // Verificar si viene desde el botón Dashboard mediante state
  if (!location.state || !location.state.fromDashboard) {
    navigate('/', { replace: true });
  }
}, [location, navigate]);
```

## Flujo de Uso

### Para Usuario ADMIN:

1. Accede a la página principal (`/`)
2. Hace clic en el botón de "Dashboard" (ícono de configuración)
3. Es redirigido a `/login` con state `{ fromDashboard: true }`
4. Ingresa email y contraseña
5. Al autenticarse correctamente, es redirigido a `/users` (Gestión de Usuarios)

### Para Usuario KITCHEN:

1. Accede a la página principal (`/`)
2. Hace clic en el botón de "Dashboard"
3. Es redirigido a `/login`
4. Ingresa email y contraseña
5. Al autenticarse correctamente, es redirigido a `/kitchen` (Panel de Cocina)

### Mensajes de Error Específicos:

- **Email no existe:** "No existe una cuenta con este correo electrónico."
- **Contraseña incorrecta:** "Contraseña incorrecta. Por favor verifica tus credenciales."
- **Email inválido:** "El formato del correo electrónico es inválido."
- **Cuenta desactivada:** "Esta cuenta ha sido desactivada. Contacta al administrador."
- **Demasiados intentos:** "Demasiados intentos fallidos. Por favor intenta más tarde."
- **Sin conexión:** "Error de conexión. Verifica tu conexión a internet."
- **Credenciales inválidas:** "Credenciales inválidas. Verifica tu correo y contraseña."
- **Rol no autorizado:** "Acceso denegado: Tu rol actual es "[ROL]". Solo usuarios con rol ADMIN o KITCHEN pueden acceder."

## Validaciones Implementadas

1. ✅ Email requerido con formato válido
2. ✅ Contraseña requerida
3. ✅ Validación de rol permitido (ADMIN o KITCHEN)
4. ✅ Protección contra acceso directo a `/login`
5. ✅ Manejo de errores específicos de Firebase
6. ✅ Protección de rutas según rol
7. ✅ Persistencia de sesión en localStorage

## Seguridad Implementada

1. **Autenticación con Firebase:** Utiliza Firebase Authentication con email/password
2. **Validación de Custom Claims:** Verifica roles desde los custom claims de Firebase
3. **Protección de Rutas:** Implementa ProtectedRoute para rutas sensibles
4. **Redirección automática:** Evita acceso no autorizado redirigiendo a rutas permitidas
5. **Mensajes seguros:** No expone información sensible en mensajes de error

## Cumplimiento de Criterios

✅ **Criterio 1:** Autenticación exitosa con Firebase redirige a la interfaz correspondiente al rol
- ADMIN → `/users` (Gestión de Usuarios)
- KITCHEN → `/kitchen` (Panel de Cocina)
- Implementado en `handleSuccessfulLogin()`

✅ **Criterio 2:** Mensaje de error claro ante credenciales incorrectas
- 8 tipos de errores específicos implementados
- Mensajes en español claros y descriptivos
- Implementado en `handleAuthError()`

## Pruebas de Funcionamiento

### Prueba 1: Login exitoso como ADMIN
```
Email: admin@restaurante.com
Password: [contraseña]
Resultado esperado: Redirección a /users
```

### Prueba 2: Login exitoso como KITCHEN
```
Email: cocina@restaurante.com
Password: [contraseña]
Resultado esperado: Redirección a /kitchen
```

### Prueba 3: Credenciales incorrectas
```
Email: usuario@ejemplo.com
Password: incorrecta
Resultado esperado: "Contraseña incorrecta. Por favor verifica tus credenciales."
```

### Prueba 4: Usuario no existe
```
Email: noexiste@ejemplo.com
Password: cualquiera
Resultado esperado: "No existe una cuenta con este correo electrónico."
```

### Prueba 5: Usuario sin rol válido
```
Email: sinrol@restaurante.com
Password: [contraseña]
Resultado esperado: "Acceso denegado: Tu rol actual es 'NO ASIGNADO'..."
```

## Notas de Implementación

- El componente usa React Hooks (useState, useEffect, useContext)
- Integración completa con Firebase Authentication
- Estado global manejado por AuthContext
- Diseño responsive y accesible
- Interfaz moderna con Tailwind CSS
- Soporte para recuperación de contraseña

## Archivos Relacionados

- [Login.jsx](c:\Users\edwin.giraldo\Documents\TrabajoMiercoles17\restaurant-frontend\src\components\Login.jsx) - Componente de Login
- [AuthContext.jsx](c:\Users\edwin.giraldo\Documents\TrabajoMiercoles17\restaurant-frontend\src\context\AuthContext.jsx) - Contexto de Autenticación
- [ProtectedRoute.jsx](c:\Users\edwin.giraldo\Documents\TrabajoMiercoles17\restaurant-frontend\src\components\ProtectedRoute.jsx) - Protección de Rutas
- [App.jsx](c:\Users\edwin.giraldo\Documents\TrabajoMiercoles17\restaurant-frontend\src\App.jsx) - Configuración de Rutas
- [firebaseConfig.js](c:\Users\edwin.giraldo\Documents\TrabajoMiercoles17\restaurant-frontend\src\firebaseConfig.js) - Configuración de Firebase
