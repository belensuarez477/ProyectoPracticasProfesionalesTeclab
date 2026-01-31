# GUÍA PASO A PASO: Desde Cero hasta Producción

## FASE 1: PREPARACIÓN INICIAL (15 minutos)

### Paso 1.1: Crear Proyecto en Firebase Console
1. Ve a https://console.firebase.google.com/
2. Haz clic en **"Crear proyecto"**
3. Nombre: `estetica-servicios`
4. Desactiva Google Analytics
5. Haz clic en **"Crear proyecto"**
6. Espera a que se cree (1-2 minutos)

### Paso 1.2: Habilitar Authentication
1. En Firebase Console, ve a **Authentication** (en el menú izquierdo)
2. Haz clic en **"Comenzar"**
3. Ve a la pestaña **"Método de acceso"**
4. Busca **"Email/Contraseña"** y haz clic en él
5. Activa la opción **"Email/Contraseña"**
6. Haz clic en **"Guardar"**

✓ Ahora los usuarios pueden registrarse con email y contraseña

### Paso 1.3: Crear Firestore Database
1. Ve a **Firestore Database** (menú izquierdo)
2. Haz clic en **"Crear base de datos"**
3. En "Ubicación de seguridad", selecciona una región cercana a tus usuarios
   - Por ejemplo: `europe-west1` (Bélgica) si es Europa
   - O `us-central1` (USA) si es América
4. Haz clic en **"Siguiente"**
5. Selecciona **"Empezar en modo de prueba"** (por ahora)
6. Haz clic en **"Crear"**

✓ Tu base de datos está lista

⚠️ **IMPORTANTE**: En modo de prueba, CUALQUIERA puede leer y escribir.
Cambiaremos esto en Fase 3 con reglas de seguridad.

### Paso 1.4: Descargar Credenciales
1. Ve a **Configuración del Proyecto** (⚙️ arriba a la izquierda)
2. Ve a la pestaña **"Cuentas de servicio"**
3. Haz clic en **"Generar nueva clave privada"**
4. Se descargará un archivo JSON
5. Guarda este archivo como `serviceAccountKey.json` en la raíz del proyecto backend

```
backend/
├── serviceAccountKey.json  ← AQUÍ
├── server.js
├── firebase-config.js
└── ...
```

⚠️ **NUNCA compartir este archivo ni subirlo a GitHub**

### Paso 1.5: Obtener URL de la Base de Datos
1. En Firestore Database, ve a **"Configuración"** (en la página de Firestore)
2. Copia la URL que comienza con `https://...`
3. Guárdala en el `.env`:

```
FIREBASE_DATABASE_URL=https://tu-proyecto-id.firebaseio.com
```

---

## FASE 2: CONFIGURAR EL PROYECTO BACKEND (10 minutos)

### Paso 2.1: Instalar Node.js (si no lo tienes)
1. Descarga desde https://nodejs.org/ (versión LTS)
2. Instala siguiendo los pasos
3. Abre PowerShell y verifica:
   ```powershell
   node --version
   npm --version
   ```

### Paso 2.2: Instalar Dependencias
Abre PowerShell en la carpeta `backend` y ejecuta:

```powershell
npm install
```

Esto instalará:
- `express` → Framework para crear API
- `firebase-admin` → Conectar con Firebase desde backend
- `dotenv` → Usar variables de entorno
- `cors` → Permitir solicitudes desde frontend
- `nodemon` → Reiniciar servidor automáticamente

✓ Se creará la carpeta `node_modules/` (puede tardar 1-2 minutos)

### Paso 2.3: Configurar Variables de Entorno
1. Abre el archivo `.env` en VS Code
2. Actualiza los valores con los de tu proyecto Firebase:

```env
PORT=5000
FIREBASE_PROJECT_ID=estetica-servicios
FIREBASE_PRIVATE_KEY_ID=ABC123...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n....\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxx@estetica-servicios.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=123456789
FIREBASE_DATABASE_URL=https://estetica-servicios.firebaseio.com
```

Puedes obtener estos valores del archivo `serviceAccountKey.json`:
- Abre `serviceAccountKey.json` en VS Code
- Copia los valores correspondientes al `.env`

### Paso 2.4: Verificar Configuración
En PowerShell (en carpeta backend), ejecuta:

```powershell
npm run dev
```

Deberías ver:
```
✓ Servidor ejecutándose en puerto 5000
✓ API disponible en http://localhost:5000
```

🎉 **¡Backend está listo!**

Presiona `Ctrl + C` para detener el servidor (lo volveremos a iniciar después)

---

## FASE 3: CREAR LA ESTRUCTURA DE DATOS (Manual desde Firebase Console)

### Paso 3.1: Crear Colecciones
En Firebase Console > Firestore, crea estas colecciones:

#### Colección 1: `users`
Haz clic en **"Crear colección"** y nombra `users`

No necesitas agregar documentos ahora (se crean al registrarse)

#### Colección 2: `turnos`
Haz clic en **"Crear colección"** y nombra `turnos`

También se crearán automáticamente con los turnos agendados

### Paso 3.2: Crear Índices (Opcional pero recomendado)
Para futuras búsquedas complejas, en Firestore:
1. Ve a la pestaña **"Índices"**
2. Firebase te sugerirá crear índices cuando los necesites

Nota: Los índices se crean automáticamente para queries simples

---

## FASE 4: PROBAR LA API (10 minutos)

### Paso 4.1: Iniciar el Servidor
En PowerShell (carpeta backend):

```powershell
npm run dev
```

Deja ejecutándose

### Paso 4.2: Abrir Herramienta para Probar
Opción A: **Postman** (Recomendado)
- Descarga desde https://www.postman.com/downloads/
- Instala y abre

Opción B: **Thunder Client** (Extensión de VS Code)
- En VS Code, ve a Extensiones
- Busca "Thunder Client"
- Instala

Opción C: **curl** (Línea de comandos)

### Paso 4.3: Probar Registro de Usuario

**Con Postman:**
1. Haz clic en **"+"** para nueva solicitud
2. Método: `POST`
3. URL: `http://localhost:5000/auth/registro`
4. Ve a la pestaña **Body**
5. Selecciona **raw** y **JSON**
6. Copia esto:

```json
{
  "email": "maria@example.com",
  "password": "password123",
  "nombre": "María",
  "apellido": "García",
  "telefono": "+34612345678",
  "tipoUsuario": "profesional"
}
```

7. Haz clic en **"Send"**

Deberías recibir:
```json
{
  "mensaje": "Usuario registrado exitosamente",
  "uid": "user123abc...",
  "email": "maria@example.com",
  "tipoUsuario": "profesional"
}
```

✓ ¡El usuario está registrado!

Puedes verificar en Firebase Console > Authentication > Usuarios

### Paso 4.4: Probar Login

**Con Postman:**
1. Nueva solicitud POST
2. URL: `http://localhost:5000/auth/login`
3. Body (JSON):

```json
{
  "email": "maria@example.com",
  "password": "password123"
}
```

4. Send

Deberías recibir un token JWT:
```json
{
  "mensaje": "Inicio de sesión exitoso",
  "token": "eyJhbGciOiJSUzI1NiIs...",
  "usuario": {
    "uid": "user123abc...",
    "email": "maria@example.com",
    ...
  }
}
```

**Copia este token** (los primeros 50 caracteres) - lo necesitaremos para siguientes pruebas

### Paso 4.5: Probar Crear Servicio (Necesitas el token)

**Con Postman:**
1. Nueva solicitud POST
2. URL: `http://localhost:5000/servicios`
3. Headers: Ve a la pestaña **Headers**
   - Clave: `Authorization`
   - Valor: `Bearer eyJhbGciOiJSUzI1NiIs...` (pega el token)
4. Body (JSON):

```json
{
  "nombre": "Limpieza Facial",
  "descripcion": "Limpieza profunda del rostro",
  "precio": 35.00,
  "duracion": 60
}
```

5. Send

Respuesta esperada:
```json
{
  "mensaje": "Servicio creado exitosamente",
  "servicioId": "serv001"
}
```

**Guarda este servicioId** - lo necesitaremos para agendar turnos

### Paso 4.6: Pruebas Completas

Sigue los ejemplos en `GUIA_FIREBASE.md` sección "EJEMPLOS DE USO DE LA API"

---

## FASE 5: IMPLEMENTAR SEGURIDAD (Producción)

### Paso 5.1: Actualizar Reglas de Firestore

En Firebase Console > Firestore > **Reglas**, reemplaza todo con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Usuarios: solo acceso propio
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      // Servicios públicos (profesional puede crear/editar)
      match /servicios/{servicioId} {
        allow read: if true;
        allow write: if request.auth.uid == userId;
        
        // Horarios
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

Haz clic en **"Publicar"**

### Paso 5.2: Desactivar Modo de Prueba
1. Ve a Firestore Database
2. Ve a **Reglas**
3. Debería mostrar las reglas que acabas de publicar
4. ¡Ya no está en modo de prueba!

---

## FASE 6: CREAR FRONTEND (Próximo paso)

Ahora que el backend está listo, puedes crear el frontend:

### Opción A: React
```bash
npx create-react-app frontend
cd frontend
npm install axios
```

### Opción B: Vue
```bash
npm create vite@latest frontend -- --template vue
cd frontend
npm install axios
```

Crea solicitudes HTTP a tu backend:
```javascript
const response = await fetch('http://localhost:5000/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

---

## FASE 7: DESPLEGAR A PRODUCCIÓN

### Opción A: Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

### Opción B: Heroku / Railway / Render
1. Crea una cuenta en Heroku (https://www.heroku.com)
2. Conecta tu repositorio GitHub
3. Despliega automáticamente

### Opción C: Servidor VPS (DigitalOcean, AWS, etc.)
1. Renta un VPS
2. Instala Node.js
3. Clona tu repositorio
4. Ejecuta `npm run dev` (o usa PM2 para mantenerlo activo)

---

## CHECKLIST FINAL

- [ ] Proyecto Firebase creado
- [ ] Authentication habilitado
- [ ] Firestore Database creado
- [ ] serviceAccountKey.json descargado y guardado
- [ ] Dependencias instaladas (`npm install`)
- [ ] .env configurado
- [ ] Servidor ejecutándose (`npm run dev`)
- [ ] Pruebas básicas pasadas (registro, login, crear servicio)
- [ ] Reglas de seguridad publicadas
- [ ] Frontend conectado al backend
- [ ] Funcionamiento completo probado
- [ ] Desplegado a producción

---

## SOLUCIÓN DE PROBLEMAS

### Problema: "serviceAccountKey.json not found"
**Solución**: Verifica que el archivo esté en la raíz del backend, no en una subcarpeta

### Problema: "Error: CORS policy"
**Solución**: El frontend debe estar en `http://localhost:3000` y el backend en `http://localhost:5000`

### Problema: "Token inválido"
**Solución**: Asegúrate de que:
1. Estés usando el token del login reciente (expira después de 1 hora)
2. Incluyas `Authorization: Bearer <token>` en los headers

### Problema: "Turno no se puede agendar"
**Solución**: Verifica que:
1. El profesional haya establecido horarios para ese día
2. El horario esté dentro del rango (ej: 09:00-17:00)
3. No haya otro turno en el mismo horario

---

¡Ahora estás listo para desarrollar! 🚀
