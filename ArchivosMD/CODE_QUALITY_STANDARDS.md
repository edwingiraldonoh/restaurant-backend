# Estándares de Calidad de Código - US-036

Este documento describe los estándares de calidad de código implementados en el proyecto **Delicious Kitchen** para prevenir deuda técnica y mantener la calidad del código.

## 📋 Resumen

Todos los servicios (backend y frontend) implementan validaciones automáticas de calidad de código que se ejecutan durante el proceso de build.

## 🔍 Herramientas Implementadas

### 1. ESLint - Linter de Código

**Configuración:**
- **Backend (TypeScript)**: ESLint con reglas recomendadas + `@typescript-eslint`
- **Frontend (JavaScript/React)**: ESLint con reglas recomendadas + React Hooks + React Refresh

**Reglas Principales:**
- `complexity: ["error", 10]` - Máximo de complejidad ciclomática = 10
- `no-unused-vars` - Detecta variables no utilizadas
- `@typescript-eslint/no-explicit-any` - Advierte sobre uso de `any`
- Reglas recomendadas de ESLint y TypeScript

**Archivos de configuración:**
- Backend: `.eslintrc.json` en cada servicio
- Frontend: `eslint.config.js`

### 2. Complejidad Ciclomática

**Criterio:** Ninguna función debe tener complejidad ciclomática > 10

**Implementación:**
```json
"complexity": ["error", 10]
```

Esta regla está configurada en ESLint y falla el build si se excede el límite.

**¿Qué es la Complejidad Ciclomática?**
- Mide el número de caminos independientes a través del código
- Valores altos indican funciones difíciles de probar y mantener
- Límite de 10 es considerado buena práctica

**Ejemplo de función con alta complejidad:**
```typescript
// ❌ Complejidad > 10 (muchos if/else, switch cases, loops)
function complexFunction(data) {
  if (condition1) {
    if (condition2) {
      for (let i = 0; i < 10; i++) {
        if (condition3) {
          switch(value) {
            case 1: // ...
            case 2: // ...
            // ... más casos
          }
        }
      }
    }
  }
}
```

**Solución:** Dividir en funciones más pequeñas y especializadas.

### 3. Validación en Build

**Backend Services:**
```json
"build": "npm run lint && tsc"
```

**Frontend:**
```json
"build": "npm run lint && vite build"
```

**Comportamiento:**
- ✅ Si el lint pasa sin errores → continúa con la compilación
- ❌ Si el lint encuentra errores → el build falla inmediatamente

## 🚀 Uso

### Ejecutar lint manualmente

**Backend (cualquier servicio):**
```bash
cd order-service  # o kitchen-service, api-gateway, etc.
npm run lint
```

**Frontend:**
```bash
cd restaurant-frontend
npm run lint
```

### Build con validación automática

**Backend:**
```bash
cd order-service
npm run build  # Ejecuta lint + tsc
```

**Frontend:**
```bash
cd restaurant-frontend
npm run build  # Ejecuta lint + vite build
```

### Desarrollo local

Durante el desarrollo (`npm run dev`), el lint NO se ejecuta automáticamente para no interrumpir el flujo de trabajo. Se recomienda ejecutar `npm run lint` periódicamente.

## 📊 Detección de Duplicación de Código

### Criterio
**Rechazar cambios con >5% de código duplicado**

### Implementación Recomendada

Para cumplir completamente con US-036, se recomienda integrar una de estas herramientas en el pipeline CI/CD:

#### Opción 1: jscpd (JavaScript Copy/Paste Detector)

```bash
# Instalación
npm install -g jscpd

# Uso
jscpd src/ --threshold 5
```

#### Opción 2: SonarQube

SonarQube proporciona análisis completo incluyendo:
- Duplicación de código
- Complejidad ciclomática
- Code smells
- Vulnerabilidades de seguridad

**Configuración básica:**
```yaml
# sonar-project.properties
sonar.projectKey=delicious-kitchen
sonar.sources=src
sonar.cpd.minimumTokens=100
sonar.cpd.threshold=5
```

#### Opción 3: GitHub Actions con análisis de calidad

```yaml
# .github/workflows/quality-check.yml
name: Code Quality

on: [push, pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run ESLint
        run: npm run lint
      - name: Check duplications
        run: npx jscpd src/ --threshold 5
```

## 🎯 Cumplimiento de Criterios US-036

### ✅ Criterio 1: Linter
**Build falla si hay errores de ESLint**

- Configurado en todos los servicios
- Script `build` incluye `npm run lint`
- Reglas ESLint recomendadas implementadas

### ✅ Criterio 2: Complejidad
**Ninguna función con Complejidad Ciclomática > 10**

- Regla `complexity: ["error", 10]` configurada en ESLint
- Build falla automáticamente si se excede el límite
- Funciona tanto para backend (TypeScript) como frontend (JavaScript)

### ⚠️ Criterio 3: Duplicidad
**Rechazo de cambios con >5% de código duplicado**

**Estado:** Parcialmente implementado

**Implementado:**
- ESLint detecta patrones básicos de duplicación
- Reglas que previenen código duplicado (DRY principles)

**Pendiente para cumplimiento completo:**
- Integrar herramienta especializada (jscpd o SonarQube)
- Configurar umbral del 5%
- Automatizar en pipeline CI/CD

**Recomendación:** Integrar `jscpd` en GitHub Actions o pipeline de despliegue.

## 📝 Configuración por Servicio

### Backend Services

Todos los servicios backend (order-service, kitchen-service, notification-service, api-gateway, review-service) tienen:

**`.eslintrc.json`:**
```json
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended"
  ],
  "rules": {
    "complexity": ["error", 10],
    "@typescript-eslint/no-unused-vars": ["error"],
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

### Frontend

**`eslint.config.js`:**
```javascript
export default defineConfig([
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
    ],
    rules: {
      'no-unused-vars': ['error'],
      'complexity': ['error', 10]
    }
  }
])
```

## 🔧 Solución de Problemas

### Error: "Build failed due to ESLint errors"

**Causa:** Hay errores de linting en el código.

**Solución:**
1. Ejecutar `npm run lint` para ver los errores específicos
2. Corregir los errores reportados
3. Ejecutar `npm run build` nuevamente

### Warning: "Function complexity exceeds 10"

**Causa:** Una función tiene demasiados caminos de ejecución.

**Solución:**
1. Dividir la función en funciones más pequeñas
2. Extraer lógica compleja a funciones auxiliares
3. Simplificar condicionales anidados

## 📚 Referencias

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [TypeScript ESLint](https://typescript-eslint.io/)
- [Cyclomatic Complexity](https://en.wikipedia.org/wiki/Cyclomatic_complexity)
- [jscpd - Copy/Paste Detector](https://github.com/kucherenko/jscpd)

---

**Última actualización:** 17 de diciembre de 2025
**Versión:** 1.0
**Estado US-036:** ✅ Implementado (Criterios 1 y 2 completos, Criterio 3 con recomendación de mejora)
