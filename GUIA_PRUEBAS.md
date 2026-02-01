# 🧪 Guía de Pruebas: Frontend + Backend

## ✅ Configuración Completada

### **Backend Endpoints:**
- Base URL: `http://localhost:5000`
- **Autenticación:**
  - `POST /auth/registro` - Registrar usuario
  - `POST /auth/login` - Iniciar sesión
  - `GET /auth/perfil` - Obtener perfil (requiere token)
  - `PUT /auth/perfil` - Actualizar perfil (requiere token)
  - `POST /auth/logout` - Cerrar sesión

- **Servicios:**
  - `POST /servicios` - Crear servicio (solo profesionales)
  - `GET /servicios` - Listar servicios del profesional
  - `PUT /servicios/:id` - Actualizar servicio
  - `DELETE /servicios/:id` - Eliminar servicio
  - `POST /servicios/horarios` - Establecer horarios

- **Turnos:**
  - `POST /turnos` - Agendar turno
  - `GET /turnos/:id` - Obtener turno
  - `GET /turnos/profesional/mis-turnos` - Turnos del profesional
  - `GET /turnos/cliente/mis-turnos` - Turnos del cliente
  - `PUT /turnos/:id/confirmar` - Confirmar turno
  - `PUT /turnos/:id/cancelar` - Cancelar turno

### **Frontend:**
- URL: `http://localhost:4200`
- **Servicios creados:**
  - `auth.service.ts` - Autenticación conectada al backend
  - `servicios.service.ts` - Gestión de servicios
  - `turnos.service.ts` - Gestión de turnos
  - `api.config.ts` - Configuración centralizada de endpoints

---

## 🚀 Cómo Iniciar y Probar

### **Paso 1: Iniciar el Backend**

```bash
cd backend
npm install  # Solo la primera vez
npm start
```

**Verificación:** Abre http://localhost:5000 - Deberías ver un JSON con la información de la API

### **Paso 2: Iniciar el Frontend**

En otra terminal:

```bash
cd frontend/beautysystemPage
npm install  # Solo la primera vez
npm start
```

**Verificación:** Abre http://localhost:4200 - Deberías ver tu aplicación Angular

---

## 🧪 Pruebas Paso a Paso

### **Prueba 1: Verificar Backend**

```bash
# Prueba de salud del servidor
curl http://localhost:5000

# Debería devolver:
# {
#   "mensaje": "Bienvenido a la API...",
#   "version": "1.0.0",
#   "firebaseStatus": "✅ Inicializado",
#   "endpoints": { ... }
# }
```

### **Prueba 2: Registro de Usuario**

**Desde el Frontend:**
1. Ve a http://localhost:4200/registro
2. Completa el formulario:
   - Nombre: Juan
   - Apellido: Pérez
   - Email: juan@example.com
   - Teléfono: 1234567890
   - Contraseña: 123456
   - Tipo: Cliente o Profesional
3. Presiona "Registrar"
4. Abre DevTools (F12) > Network/Red para ver la petición

**Desde curl:**
```bash
curl -X POST http://localhost:5000/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "123456",
    "nombre": "Juan",
    "apellido": "Pérez",
    "telefono": "1234567890",
    "tipoUsuario": "cliente"
  }'
```

**Respuesta esperada:**
```json
{
  "exito": true,
  "mensaje": "Usuario registrado exitosamente",
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "abc123",
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@example.com",
    "tipoUsuario": "cliente"
  }
}
```

### **Prueba 3: Login**

**Desde el Frontend:**
1. Ve a http://localhost:4200/login
2. Ingresa:
   - Email: juan@example.com
   - Contraseña: 123456
3. Presiona "Iniciar Sesión"
4. Deberías ser redirigido al dashboard

**Desde curl:**
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "123456"
  }'
```

**Guarda el token de la respuesta para las siguientes pruebas:**
```bash
TOKEN="eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### **Prueba 4: Crear Servicio (Solo Profesionales)**

**Requisito:** Debes estar logueado como profesional

```bash
curl -X POST http://localhost:5000/servicios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "nombre": "Corte de Cabello",
    "descripcion": "Corte de cabello para dama o caballero",
    "precio": 250,
    "duracion": 30
  }'
```

### **Prueba 5: Listar Servicios**

```bash
curl -X GET http://localhost:5000/servicios \
  -H "Authorization: Bearer $TOKEN"
```

### **Prueba 6: Agendar Turno (Cliente)**

**Requisito:** Necesitas el ID de un servicio y de un profesional

```bash
curl -X POST http://localhost:5000/turnos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "profesionalId": "ID_DEL_PROFESIONAL",
    "servicioId": "ID_DEL_SERVICIO",
    "fecha": "2026-02-15",
    "hora": "10:00",
    "notas": "Preferencia por la mañana"
  }'
```

### **Prueba 7: Ver Mis Turnos**

**Como Cliente:**
```bash
curl -X GET http://localhost:5000/turnos/cliente/mis-turnos \
  -H "Authorization: Bearer $TOKEN"
```

**Como Profesional:**
```bash
curl -X GET http://localhost:5000/turnos/profesional/mis-turnos \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🔍 Verificación de Comunicación Frontend-Backend

### **Con DevTools del Navegador:**

1. Abre http://localhost:4200
2. Presiona F12 para abrir DevTools
3. Ve a la pestaña "Network" (Red)
4. Intenta hacer login o registro
5. Verifica:
   - ✅ Aparece una petición a `http://localhost:5000/auth/...`
   - ✅ Status: 200 (éxito) o ver el error
   - ✅ Response contiene el token y datos del usuario

### **Errores Comunes:**

**❌ CORS Error:**
```
Access to fetch at 'http://localhost:5000/auth/login' from origin 
'http://localhost:4200' has been blocked by CORS policy
```
**Solución:** Ya está configurado `cors()` en el backend, reinicia el servidor

**❌ Connection Refused:**
```
Failed to fetch
net::ERR_CONNECTION_REFUSED
```
**Solución:** El backend no está corriendo. Verifica que esté en `http://localhost:5000`

**❌ 404 Not Found:**
```
Cannot POST /auth/login
```
**Solución:** Verifica que las rutas del backend estén bien configuradas

---

## 📝 Checklist de Verificación

### **Backend:**
- [ ] Servidor corriendo en http://localhost:5000
- [ ] Endpoint raíz (/) devuelve JSON de bienvenida
- [ ] Firebase está inicializado correctamente
- [ ] CORS está habilitado

### **Frontend:**
- [ ] Aplicación corriendo en http://localhost:4200
- [ ] HttpClient configurado en app.config.ts
- [ ] Servicios (auth, servicios, turnos) creados
- [ ] api.config.ts apunta a http://localhost:5000
- [ ] Componentes de login y registro actualizados

### **Integración:**
- [ ] Login desde frontend envía petición al backend
- [ ] Registro guarda datos en Firebase
- [ ] Token se guarda en localStorage
- [ ] Headers de Authorization se envían correctamente
- [ ] Redirección funciona según tipo de usuario

---

## 🎯 Datos de Prueba

### **Usuario Cliente:**
```json
{
  "email": "cliente@test.com",
  "password": "123456",
  "nombre": "María",
  "apellido": "González",
  "telefono": "1122334455",
  "tipoUsuario": "cliente"
}
```

### **Usuario Profesional:**
```json
{
  "email": "profesional@test.com",
  "password": "123456",
  "nombre": "Pedro",
  "apellido": "Martínez",
  "telefono": "5544332211",
  "tipoUsuario": "profesional"
}
```

---

## 🐛 Debug

### **Ver logs del backend:**
El servidor imprime todos los requests en la consola. Verifica:
```
POST /auth/login
GET /servicios
POST /turnos
```

### **Ver requests del frontend:**
En DevTools > Network, cada petición muestra:
- **Headers:** Verifica que el token se envíe
- **Payload:** Los datos que estás enviando
- **Response:** La respuesta del servidor

---

## ✨ Próximos Pasos

Una vez que todo funcione:
1. Implementar guards de autenticación en las rutas
2. Agregar interceptor HTTP para añadir el token automáticamente
3. Crear componentes para gestión de servicios
4. Crear componentes para gestión de turnos
5. Agregar validaciones de formularios más robustas

---

**¿Algo no funciona?** Revisa:
1. Ambos servidores están corriendo
2. No hay errores en la consola del backend
3. No hay errores en DevTools del navegador
4. Los puertos 4200 y 5000 no están ocupados
