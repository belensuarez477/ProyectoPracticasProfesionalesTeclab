# GUÍA COMPLETA: Configuración de Firebase para Gestión de Servicios Estéticos

## PARTE 1: CONFIGURAR FIREBASE

### Paso 1: Crear Proyecto en Firebase Console

1. Ve a https://console.firebase.google.com/
2. Haz clic en "Agregar proyecto"
3. Nombre del proyecto: `estetica-servicios`
4. Desactiva Google Analytics (opcional)
5. Crea el proyecto

### Paso 2: Configurar Authentication (Autenticación)

1. En Firebase Console, ve a **Authentication**
2. Haz clic en "Comenzar"
3. En la pestaña "Método de acceso", habilita:
   - **Email/Contraseña**
4. En "Usuarios", puedes ver y administrar los usuarios registrados

### Paso 3: Crear Firestore Database

1. Ve a **Firestore Database** en Firebase Console
2. Haz clic en "Crear base de datos"
3. Selecciona región (cercana a tus usuarios)
4. Modo de seguridad: **Empezar en modo de prueba**
5. Crea la base de datos

### Paso 4: Obtener Credenciales de Administrador

1. Ve a **Configuración del Proyecto** (⚙️ arriba a la izquierda)
2. Selecciona la pestaña **Cuentas de Servicio**
3. Haz clic en **Generar nueva clave privada**
4. Se descargará un archivo JSON
5. **IMPORTANTE**: Guarda este archivo como `serviceAccountKey.json` en la raíz de tu proyecto backend

⚠️ **SEGURIDAD**: Nunca compartas este archivo. Añádelo a `.gitignore`:
```
serviceAccountKey.json
.env
node_modules/
```

### Paso 5: Obtener Configuración de Firebase para Cliente

1. En **Configuración del Proyecto**, ve a **General**
2. Desplázate hasta "Tus apps"
3. Haz clic en el icono **Web** (</>)
4. Completa el registro
5. Copia la configuración que aparece:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## PARTE 2: CONFIGURAR EL BACKEND

### Paso 1: Instalar dependencias

```bash
cd backend
npm install
```

### Paso 2: Configurar variables de entorno

1. Copia los valores del archivo JSON descargado (`serviceAccountKey.json`) al archivo `.env`
2. O simplemente copia el archivo JSON a la raíz del backend

### Paso 3: Actualizar `firebase-config.js`

Reemplaza la línea:
```javascript
const serviceAccount = require('./serviceAccountKey.json');
```

Con la ruta correcta si guardaste el archivo en otra ubicación.

### Paso 4: Iniciar el servidor

```bash
npm run dev
```

Deberías ver:
```
✓ Servidor ejecutándose en puerto 5000
✓ API disponible en http://localhost:5000
```

## PARTE 3: ESTRUCTURA DE LA BASE DE DATOS

### Colección: `users`
Contiene información de todos los usuarios (clientes y profesionales)

```javascript
{
  uid: "user123",
  email: "usuario@example.com",
  nombre: "María",
  apellido: "García",
  telefono: "+34612345678",
  tipoUsuario: "profesional", // "profesional" o "cliente"
  fotoPerfil: "https://...",
  fechaRegistro: Timestamp,
  estado: "activo"
}
```

### Subcolección: `users/{uid}/servicios`
Servicios creados por un profesional (Limpieza Facial, Depilación, etc.)

```javascript
{
  servicioId: "serv001",
  nombre: "Limpieza Facial",
  descripcion: "Limpieza profunda del rostro",
  precio: 35.00,
  duracion: 60, // minutos
  createdAt: Timestamp,
  estado: "activo"
}
```

### Subcolección: `users/{uid}/servicios/{servicioId}/horarios`
Horarios disponibles para cada servicio por día de la semana

```javascript
{
  dia: "lunes",
  horaInicio: "09:00",
  horaFin: "17:00",
  disponible: true,
  actualizadoEn: Timestamp
}
```

### Colección: `turnos`
Todos los turnos agendados en el sistema

```javascript
{
  turnoId: "turno001",
  profesionalId: "user123",
  clienteId: "user456",
  servicioId: "serv001",
  servicioNombre: "Limpieza Facial",
  fecha: Date,
  hora: "10:00",
  duracion: 60,
  estado: "confirmado", // "pendiente", "confirmado", "cancelado"
  precioFinal: 35.00,
  notas: "Cliente solicita exfoliación adicional",
  createdAt: Timestamp
}
```

## PARTE 4: EJEMPLOS DE USO DE LA API

### 1. REGISTRO DE USUARIO

**Endpoint:** `POST /auth/registro`

```bash
curl -X POST http://localhost:5000/auth/registro \
  -H "Content-Type: application/json" \
  -d '{
    "email": "profesional@example.com",
    "password": "password123",
    "nombre": "María",
    "apellido": "García",
    "telefono": "+34612345678",
    "tipoUsuario": "profesional"
  }'
```

**Respuesta:**
```json
{
  "mensaje": "Usuario registrado exitosamente",
  "uid": "user123",
  "email": "profesional@example.com",
  "tipoUsuario": "profesional"
}
```

### 2. LOGIN

**Endpoint:** `POST /auth/login`

```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "profesional@example.com",
    "password": "password123"
  }'
```

**Respuesta:**
```json
{
  "mensaje": "Inicio de sesión exitoso",
  "token": "eyJhbGciOiJSUzI1NiIs...",
  "usuario": {
    "uid": "user123",
    "email": "profesional@example.com",
    "nombre": "María",
    "apellido": "García",
    "tipoUsuario": "profesional"
  }
}
```

### 3. CREAR SERVICIO (Profesional)

**Endpoint:** `POST /servicios`

```bash
curl -X POST http://localhost:5000/servicios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -d '{
    "nombre": "Limpieza Facial",
    "descripcion": "Limpieza profunda del rostro con productos naturales",
    "precio": 35.00,
    "duracion": 60
  }'
```

**Respuesta:**
```json
{
  "mensaje": "Servicio creado exitosamente",
  "servicioId": "serv001"
}
```

### 4. ESTABLECER HORARIOS DISPONIBLES

**Endpoint:** `POST /servicios/horarios`

```bash
curl -X POST http://localhost:5000/servicios/horarios \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -d '{
    "servicioId": "serv001",
    "horarios": [
      {
        "dia": "lunes",
        "horaInicio": "09:00",
        "horaFin": "17:00",
        "disponible": true
      },
      {
        "dia": "martes",
        "horaInicio": "09:00",
        "horaFin": "17:00",
        "disponible": true
      },
      {
        "dia": "miércoles",
        "horaInicio": "10:00",
        "horaFin": "14:00",
        "disponible": true
      }
    ]
  }'
```

### 5. AGENDAR TURNO (Cliente)

**Endpoint:** `POST /turnos`

```bash
curl -X POST http://localhost:5000/turnos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -d '{
    "profesionalId": "user123",
    "servicioId": "serv001",
    "fecha": "2026-02-10",
    "hora": "10:00",
    "notas": "Preferencia: sin productos químicos"
  }'
```

**Respuesta:**
```json
{
  "mensaje": "Turno solicitado exitosamente",
  "turnoId": "turno001",
  "estado": "pendiente"
}
```

### 6. CONFIRMAR TURNO (Profesional)

**Endpoint:** `PUT /turnos/{turnoId}/confirmar`

```bash
curl -X PUT http://localhost:5000/turnos/turno001/confirmar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..." \
  -d '{
    "precioFinal": 35.00
  }'
```

### 7. OBTENER MIS TURNOS (Profesional)

**Endpoint:** `GET /turnos/profesional/mis-turnos?estado=confirmado`

```bash
curl -X GET "http://localhost:5000/turnos/profesional/mis-turnos?estado=confirmado" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIs..."
```

## PARTE 5: REGLAS DE SEGURIDAD DE FIRESTORE

Una vez completes el desarrollo, cambia las reglas de seguridad. En Firebase Console > Firestore > Reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Usuarios: solo pueden acceder/editar sus propios datos
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      // Servicios del profesional
      match /servicios/{servicioId} {
        allow read: if true; // Público puede ver servicios
        allow write: if request.auth.uid == userId;
        
        // Horarios de los servicios
        match /horarios/{dia} {
          allow read: if true;
          allow write: if request.auth.uid == userId;
        }
      }
    }
    
    // Turnos
    match /turnos/{turnoId} {
      allow read: if request.auth.uid == resource.data.clienteId || 
                     request.auth.uid == resource.data.profesionalId;
      allow create: if request.auth.uid == request.resource.data.clienteId;
      allow update: if request.auth.uid == resource.data.clienteId || 
                       request.auth.uid == resource.data.profesionalId;
    }
  }
}
```

## PARTE 6: FLUJO DE USO COMPLETO

### Escenario: María (Profesional) y Juan (Cliente)

1. **María se registra como profesional**
   - POST /auth/registro (tipoUsuario: "profesional")

2. **María crea sus servicios**
   - POST /servicios (Limpieza Facial, Depilación, etc.)

3. **María establece sus horarios**
   - Lunes y Martes: 09:00-17:00 para Limpieza Facial
   - Miércoles: 10:00-14:00 para Depilación
   - POST /servicios/horarios

4. **Juan se registra como cliente**
   - POST /auth/registro (tipoUsuario: "cliente")

5. **Juan ve los servicios de María**
   - GET /servicios/profesional/{mariaId}

6. **Juan agenda un turno**
   - POST /turnos (solicita turno para Limpieza Facial el lunes a las 10:00)

7. **María confirma el turno**
   - PUT /turnos/{turnoId}/confirmar

8. **Juan ve su turno confirmado**
   - GET /turnos/cliente/mis-turnos

## NOTAS IMPORTANTES

- **Token JWT**: Guarda el token en el localStorage/sessionStorage del frontend
- **Validaciones**: Todas las horas se validan automáticamente contra los horarios establecidos
- **Conflictos**: El sistema impide agendar dos turnos superpuestos
- **Flexibilidad**: Los precios pueden variar por turno si se modifican en la confirmación
- **Cancelaciones**: Tanto cliente como profesional pueden cancelar turnos

## PRÓXIMOS PASOS

1. Crear el frontend con React/Vue para consumir esta API
2. Agregar autenticación con Google/Facebook
3. Implementar notificaciones por email/SMS
4. Agregar pagos con Stripe o PayPal
5. Crear dashboard de estadísticas
