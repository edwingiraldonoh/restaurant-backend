Firebase Admin API (minimal)

1) Preparación
- Ve a Firebase Console > Project Settings > Service accounts > Generate new private key. Descarga `serviceAccountKey.json` y colócalo en `restaurant-backend/firebase-admin-api/`.
- Copia `.env.example` a `.env` y configura `SERVICE_ACCOUNT_PATH` y `API_KEY`.

2) Instalar dependencias y arrancar
```
cd restaurant-backend/firebase-admin-api
npm install
npm start
```

### Ejecutar con Docker
```bash
cd restaurant-backend
# Definir API key temporalmente (PowerShell)
$Env:ADMIN_API_KEY = "mi-api-key-segura"
docker compose up --build firebase-admin-api
```

3) Asignar roles a usuarios

**Opción A - Scripts PowerShell (Windows - Recomendado):**
```powershell
cd restaurant-backend/firebase-admin-api

# Para asignar rol de ADMIN:
.\set-admin-role.ps1 <UID_DEL_USUARIO>

# Para asignar rol de KITCHEN (Cocinero):
.\set-kitchen-role.ps1 <UID_DEL_USUARIO>
```

**Opción B - Script Node.js (Node CLI):**
```bash
cd restaurant-backend/firebase-admin-api
# Edita .env si necesitas cambiar API_URL/API_KEY
node scripts/set-role.js <UID_DEL_USUARIO> ADMIN true
node scripts/set-role.js <UID_DEL_USUARIO> KITCHEN false
```

4) Alternativa: usar curl
```
curl -X POST http://localhost:4001/set-role/<UID> -H "x-api-key: <API_KEY>" -H "Content-Type: application/json" -d '{"role":"ADMIN","adminClaim":true}'
```

Nota: El endpoint está protegido por una API key simple; en producción debes usar un mecanismo más seguro (VPN/WHITELISTING/Authenticated requests).

5) Listar usuarios (nuevo endpoint)
```
GET http://localhost:4001/list-users
Headers:
	x-api-key: <API_KEY>

Respuesta: { ok: true, users: [ ... ] }
```

Integración en frontend
- Si deseas que los administradores vean la lista completa, configura en el frontend la variable Vite `VITE_ADMIN_API_URL` apuntando a la API (por ejemplo `http://localhost:4001`).
- Opcionalmente guarda la API key en `localStorage.setItem('adminApiKey', '<API_KEY>')` para que `usersService.getUsers()` la use al llamar a `/list-users`.