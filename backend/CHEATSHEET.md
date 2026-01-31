# REFERENCIA RÁPIDA - CHEAT SHEET

## 🚀 INICIO RÁPIDO (5 MINUTOS)

```bash
# 1. Instalar
npm install

# 2. Ejecutar
npm run dev

# 3. Listo - API en http://localhost:5000
```

---

## 🔐 ENDPOINTS RÁPIDOS

### Autenticación
```bash
# Registro
POST /auth/registro
{
  "email": "user@example.com",
  "password": "pass123",
  "nombre": "Nombre",
  "apellido": "Apellido",
  "tipoUsuario": "profesional"  // o "cliente"
}

# Login
POST /auth/login
{
  "email": "user@example.com",
  "password": "pass123"
}
```

### Servicios (Profesional)
```bash
# Crear servicio
POST /servicios
Authorization: Bearer <token>
{
  "nombre": "Limpieza Facial",
  "descripcion": "Limpieza facial profunda",
  "precio": 35.00,
  "duracion": 60
}

# Establecer horarios
POST /servicios/horarios
Authorization: Bearer <token>
{
  "servicioId": "serv001",
  "horarios": [
    { "dia": "lunes", "horaInicio": "09:00", "horaFin": "17:00" }
  ]
}

# Ver mis servicios
GET /servicios
Authorization: Bearer <token>
```

### Turnos (Cliente)
```bash
# Agendar turno
POST /turnos
Authorization: Bearer <token>
{
  "profesionalId": "prof123",
  "servicioId": "serv001",
  "fecha": "2026-02-10",
  "hora": "10:00"
}

# Ver mis turnos
GET /turnos/cliente/mis-turnos
Authorization: Bearer <token>
```

### Turnos (Profesional)
```bash
# Ver mis turnos
GET /turnos/profesional/mis-turnos
Authorization: Bearer <token>

# Confirmar turno
PUT /turnos/turno001/confirmar
Authorization: Bearer <token>
{
  "precioFinal": 35.00
}
```

---

## 📊 ESTRUCTURA FIRESTORE

```
firestore/
├── users/
│   └── {uid}/
│       ├── email
│       ├── nombre
│       ├── tipoUsuario: "profesional" | "cliente"
│       └── servicios/
│           └── {servicioId}/
│               ├── nombre
│               ├── precio
│               ├── duracion
│               └── horarios/
│                   └── {dia}: { horaInicio, horaFin }
└── turnos/
    └── {turnoId}/
        ├── profesionalId
        ├── clienteId
        ├── servicioId
        ├── fecha
        ├── hora
        ├── estado: "pendiente" | "confirmado" | "cancelado"
        └── precioFinal
```

---

## 🛠️ HERRAMIENTAS NECESARIAS

| Herramienta | Propósito | Descargar |
|------------|----------|-----------|
| **Node.js** | Runtime JavaScript | nodejs.org |
| **VS Code** | Editor (opcional) | code.visualstudio.com |
| **Postman** | Probar API | postman.com |
| **Firebase** | Base de datos | firebase.google.com |
| **Git** (opcional) | Control de versiones | git-scm.com |

---

## 📝 CREAR USUARIO PROFESIONAL

```bash
# 1. Registrar
curl -X POST http://localhost:5000/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "email": "prof@example.com",
    "password": "pass123",
    "nombre": "María",
    "apellido": "García",
    "tipoUsuario": "profesional"
  }'

# 2. Copiar uid de respuesta → uid_prof

# 3. Login
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "prof@example.com",
    "password": "pass123"
  }'

# 4. Copiar token de respuesta → token_prof
```

---

## 📝 CREAR CLIENTE Y AGENDAR TURNO

```bash
# 1. Registrar cliente
curl -X POST http://localhost:5000/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "email": "cliente@example.com",
    "password": "pass123",
    "nombre": "Juan",
    "apellido": "Pérez",
    "tipoUsuario": "cliente"
  }'

# 2. Login cliente → token_cliente

# 3. Agendar turno
curl -X POST http://localhost:5000/turnos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token_cliente" \
  -d '{
    "profesionalId": "uid_prof",
    "servicioId": "serv001",
    "fecha": "2026-02-10",
    "hora": "10:00"
  }'

# 4. Confirmar turno (como profesional)
curl -X PUT http://localhost:5000/turnos/turno001/confirmar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer token_prof" \
  -d '{
    "precioFinal": 35.00
  }'
```

---

## 🔄 FLUJO TÍPICO

```
1. Profesional se registra
   └─ tipoUsuario: "profesional"

2. Profesional crea servicio
   └─ nombre, precio, duración

3. Profesional establece horarios
   └─ Por cada día: horaInicio, horaFin

4. Cliente se registra
   └─ tipoUsuario: "cliente"

5. Cliente ve servicios
   └─ GET /servicios/profesional/{id}

6. Cliente agend turno
   └─ Valida: disponibilidad, horario, conflictos

7. Profesional confirma
   └─ estado: "confirmado"

8. Cliente ve turno confirmado
   └─ GET /turnos/cliente/mis-turnos
```

---

## ✅ VALIDACIONES AUTOMÁTICAS

```javascript
// Sistema automático valida:
✓ ¿Existe el profesional?
✓ ¿Existe el servicio?
✓ ¿Está disponible ese día?
✓ ¿La hora está en el rango?
✓ ¿No hay otro turno superpuesto?
✓ ¿El cliente está autenticado?
✓ ¿El profesional es quien confirma?
```

---

## 🐛 ERRORES COMUNES

| Error | Causa | Solución |
|-------|-------|----------|
| "Token inválido" | Token expirado o incorrecto | Hacer login nuevamente |
| "No se puede agendar" | Horario no disponible | Establecer horarios primero |
| "Conflicto de turno" | Otro turno en ese horario | Elegir otra hora |
| "No tienes permiso" | Tipo de usuario incorrecto | Verificar tipoUsuario |
| "serviceAccountKey not found" | Archivo en lugar incorrecto | Mover a raíz del backend |

---

## 📱 HEADERS NECESARIOS

```javascript
// Para endpoints protegidos:
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <token_jwt>"
}

// Para registro y login:
{
  "Content-Type": "application/json"
}
```

---

## 🔑 VARIABLES A GUARDAR

```javascript
// Después del registro:
uid = response.uid

// Después del login:
token = response.token

// Después de crear servicio:
servicioId = response.servicioId

// Después de agendar turno:
turnoId = response.turnoId
```

---

## 🧪 PROBAR CON POSTMAN

1. **Abrir Postman**
2. **Nueva solicitud** → Click **"+"**
3. **Método:** POST, GET, PUT según necesidad
4. **URL:** http://localhost:5000/...
5. **Body:** Tab "Body" → "raw" → "JSON"
6. **Headers:** Tab "Headers"
   - Key: `Authorization`
   - Value: `Bearer <token>`
7. **Send**

---

## 📦 DEPENDENCIAS INSTALADAS

```json
{
  "express": "Framework HTTP",
  "firebase-admin": "Firebase backend",
  "dotenv": "Variables de entorno",
  "cors": "Solicitudes cross-origin",
  "nodemon": "Reinicia servidor automáticamente"
}
```

---

## 🚀 DESPLIEGUE RÁPIDO

### Heroku
```bash
npm install -g heroku-cli
heroku login
heroku create nombre-app
git push heroku main
```

### Vercel
```bash
npm install -g vercel
vercel
```

### Railway
```bash
npm install -g @railway/cli
railway link
railway up
```

---

## 📚 ARCHIVOS CLAVE

| Archivo | Líneas | Propósito |
|---------|--------|----------|
| server.js | 50 | Inicia servidor |
| firebase-config.js | 15 | Conecta Firebase |
| controllers/* | 500+ | Lógica principal |
| routes/* | 200+ | Definir endpoints |
| middleware/* | 100+ | Autenticación |

---

## 🔍 DEBUG RÁPIDO

```bash
# Ver si servidor está corriendo
curl http://localhost:5000/

# Ver logs en tiempo real
npm run dev    # (ya muestra logs)

# Verificar variables de entorno
node -e "require('dotenv').config(); console.log(process.env)"

# Limpiar cache npm
npm cache clean --force

# Reinstalar dependencias
rm -r node_modules
npm install
```

---

## 💡 TIPS

1. **Guardar token en localStorage** (frontend)
   ```javascript
   localStorage.setItem('token', response.token);
   ```

2. **Usar token en solicitudes** (frontend)
   ```javascript
   headers: {
     'Authorization': `Bearer ${localStorage.getItem('token')}`
   }
   ```

3. **Fechar sesión** (frontend)
   ```javascript
   localStorage.removeItem('token');
   ```

4. **Formato de fecha** en turnos: `"2026-02-10"`

5. **Formato de hora** en turnos: `"10:00"` (24 horas)

6. **Duración en minutos**: `60` para una hora

---

## 📞 CONTACTO RÁPIDO

- **Documentación completa:** PASOS_DETALLADOS.md
- **Ejemplos API:** GUIA_FIREBASE.md
- **Diagramas:** DIAGRAMAS.md
- **Checklist:** CHECKLIST.md
- **Índice:** INDICE.md

---

**Guardá este archivo para consultas rápidas mientras desarrollas!** ⭐
