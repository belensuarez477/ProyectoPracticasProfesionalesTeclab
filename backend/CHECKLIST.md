# CHECKLIST INTERACTIVO DE CONFIGURACIÓN

## FASE 1: FIREBASE (30 minutos)

### 1.1 Crear Proyecto Firebase
```
[ ] Ir a https://console.firebase.google.com/
[ ] Haz clic en "Crear proyecto"
[ ] Nombre: estetica-servicios
[ ] Desactiva Google Analytics
[ ] Crear proyecto
```

### 1.2 Configurar Authentication
```
[ ] En Firebase Console, ve a Authentication
[ ] Haz clic en "Comenzar"
[ ] Habilita "Email/Contraseña"
[ ] Guarda cambios
```

### 1.3 Crear Firestore Database
```
[ ] Ve a Firestore Database
[ ] Haz clic en "Crear base de datos"
[ ] Selecciona región (cercana a tus usuarios)
[ ] Modo: "Empezar en modo de prueba"
[ ] Crear base de datos
```

### 1.4 Descargar Credenciales
```
[ ] Ve a Configuración del Proyecto (⚙️)
[ ] Ve a "Cuentas de Servicio"
[ ] Haz clic en "Generar nueva clave privada"
[ ] Se descarga un JSON
[ ] Guarda como: backend/serviceAccountKey.json
```

### 1.5 Obtener URL de Base de Datos
```
[ ] En Firestore, ve a Configuración
[ ] Copia la URL: https://...
[ ] Guárdala en .env como FIREBASE_DATABASE_URL
```

---

## FASE 2: BACKEND LOCAL (15 minutos)

### 2.1 Verificar Node.js
```
[ ] Abre PowerShell
[ ] Ejecuta: node --version
[ ] Ejecuta: npm --version
[ ] Si no ves versiones, instala desde https://nodejs.org/
```

### 2.2 Instalar Dependencias
```
[ ] PowerShell en carpeta backend
[ ] Ejecuta: npm install
[ ] Espera a que termine (1-2 minutos)
[ ] Verifica carpeta node_modules/ creada
```

### 2.3 Configurar .env
```
[ ] Abre archivo .env en VS Code
[ ] Copia valores del serviceAccountKey.json:
    [ ] FIREBASE_PROJECT_ID
    [ ] FIREBASE_PRIVATE_KEY_ID
    [ ] FIREBASE_PRIVATE_KEY
    [ ] FIREBASE_CLIENT_EMAIL
    [ ] FIREBASE_CLIENT_ID
    [ ] FIREBASE_DATABASE_URL
[ ] Guarda cambios
```

### 2.4 Iniciar Servidor
```
[ ] PowerShell en carpeta backend
[ ] Ejecuta: npm run dev
[ ] Deberías ver:
    ✓ Servidor ejecutándose en puerto 5000
    ✓ API disponible en http://localhost:5000
```

---

## FASE 3: PROBAR API (20 minutos)

### 3.1 Instalar Herramienta de Pruebas
```
[ ] Opción A: Descargar Postman https://www.postman.com/downloads/
[ ] O Opción B: Instalar Thunder Client en VS Code
```

### 3.2 Probar Registro
```
[ ] Abre Postman/Thunder Client
[ ] Nuevo POST a: http://localhost:5000/auth/registro
[ ] Body (JSON):
    {
      "email": "maria@example.com",
      "password": "password123",
      "nombre": "María",
      "apellido": "García",
      "telefono": "+34612345678",
      "tipoUsuario": "profesional"
    }
[ ] Haz clic en Send
[ ] Deberías recibir respuesta con uid
```

Respuesta esperada:
```json
{
  "mensaje": "Usuario registrado exitosamente",
  "uid": "user123abc...",
  "email": "maria@example.com",
  "tipoUsuario": "profesional"
}
```

### 3.3 Probar Login
```
[ ] Nuevo POST a: http://localhost:5000/auth/login
[ ] Body (JSON):
    {
      "email": "maria@example.com",
      "password": "password123"
    }
[ ] Send
[ ] Deberías recibir un token
[ ] COPIA EL TOKEN (primeros 50 caracteres)
```

Respuesta esperada:
```json
{
  "mensaje": "Inicio de sesión exitoso",
  "token": "eyJhbGciOiJSUzI1NiIs...",
  "usuario": { ... }
}
```

### 3.4 Probar Crear Servicio
```
[ ] Nuevo POST a: http://localhost:5000/servicios
[ ] Headers: Authorization: Bearer <tu_token>
[ ] Body (JSON):
    {
      "nombre": "Limpieza Facial",
      "descripcion": "Limpieza profunda del rostro",
      "precio": 35.00,
      "duracion": 60
    }
[ ] Send
[ ] Deberías recibir servicioId
[ ] GUARDA ESTE servicioId
```

### 3.5 Probar Establecer Horarios
```
[ ] Nuevo POST a: http://localhost:5000/servicios/horarios
[ ] Headers: Authorization: Bearer <tu_token>
[ ] Body (JSON):
    {
      "servicioId": "<el_servicioId_que_guardaste>",
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
        }
      ]
    }
[ ] Send
[ ] Deberías recibir "Horarios establecidos exitosamente"
```

### 3.6 Probar Obtener Servicios
```
[ ] Nuevo GET a: http://localhost:5000/servicios
[ ] Headers: Authorization: Bearer <tu_token>
[ ] Send
[ ] Deberías ver tus servicios con horarios
```

### 3.7 Crear Cliente y Agendar Turno
```
[ ] Nuevo POST a: http://localhost:5000/auth/registro
[ ] Body:
    {
      "email": "juan@example.com",
      "password": "password123",
      "nombre": "Juan",
      "apellido": "Pérez",
      "tipoUsuario": "cliente"
    }
[ ] Send (obtendrás nuevo uid para Juan)
```

```
[ ] Nuevo POST a: http://localhost:5000/auth/login
[ ] Email: juan@example.com
[ ] Password: password123
[ ] Send (obtendrás token para Juan)
[ ] COPIA ESTE TOKEN NUEVO
```

```
[ ] Nuevo POST a: http://localhost:5000/turnos
[ ] Headers: Authorization: Bearer <token_juan>
[ ] Body:
    {
      "profesionalId": "<uid_maria>",
      "servicioId": "<servicioId>",
      "fecha": "2026-02-10",
      "hora": "10:00",
      "notas": "Sin productos químicos"
    }
[ ] Send
[ ] Deberías recibir turnoId
```

### 3.8 Confirmar Turno
```
[ ] Nuevo PUT a: http://localhost:5000/turnos/<turnoId>/confirmar
[ ] Headers: Authorization: Bearer <token_maria>
[ ] Body:
    {
      "precioFinal": 35.00
    }
[ ] Send
[ ] Deberías ver "Turno confirmado exitosamente"
```

---

## FASE 4: VERIFICAR EN FIREBASE CONSOLE (10 minutos)

### 4.1 Ver Usuarios Creados
```
[ ] Firebase Console > Authentication > Usuarios
[ ] Deberías ver:
    - maria@example.com
    - juan@example.com
```

### 4.2 Ver Datos en Firestore
```
[ ] Firebase Console > Firestore Database
[ ] Deberías ver colección "users" con:
    - user123 (María)
    - user456 (Juan)
[ ] Deberías ver colección "turnos" con:
    - turno001 (confirmado)
```

---

## FASE 5: CREAR FRONTEND (Próximo paso)

### 5.1 Crear Proyecto React
```
[ ] PowerShell en carpeta padre
[ ] Ejecuta: npx create-react-app frontend
[ ] Espera a que termine
```

### 5.2 Conectar Backend
```
[ ] npm install axios
[ ] Crear servicio para llamadas HTTP
[ ] Usar ejemplos de GUIA_FIREBASE.md
```

---

## CHECKLIST FINAL DE SEGURIDAD

### Antes de Producción:
```
[ ] .env está en .gitignore
[ ] serviceAccountKey.json está en .gitignore
[ ] No compartir credenciales de Firebase
[ ] Cambiar reglas de Firestore (no estar en modo de prueba)
[ ] Validar que solo usuarios autenticados accedan a datos
```

### Publicar Reglas de Seguridad:
```
[ ] Firebase Console > Firestore > Reglas
[ ] Pegar contenido de GUIA_FIREBASE.md sección "Reglas de Seguridad"
[ ] Haz clic en "Publicar"
```

---

## LISTA DE VERIFICACIÓN - ESTADO ACTUAL

```
Proyecto Firebase:        [ ] Creado
Authentication:           [ ] Habilitado
Firestore Database:       [ ] Creado
Credenciales:             [ ] Descargadas
Backend:                  [ ] npm install OK
Servidor:                 [ ] npm run dev ejecutándose
Pruebas básicas:          [ ] Registro OK
                          [ ] Login OK
                          [ ] Crear servicio OK
                          [ ] Establecer horarios OK
                          [ ] Agendar turno OK
                          [ ] Confirmar turno OK
Frontend:                 [ ] Crear proyecto
                          [ ] Conectar backend
                          [ ] Crear interfaz profesional
                          [ ] Crear interfaz cliente
Desplegar:                [ ] Produción lista
```

---

## REFERENCIAS RÁPIDAS

| Elemento | Ubicación |
|----------|-----------|
| Firebase Console | https://console.firebase.google.com/ |
| Node.js Descargar | https://nodejs.org/ |
| Postman Descargar | https://www.postman.com/downloads/ |
| API URL Local | http://localhost:5000 |
| Documentación API | GUIA_FIREBASE.md |
| Ejemplos | tests/ejemplos-pruebas.js |

---

## COMANDO RÁPIDO PARA VERIFICAR TODO

```bash
# Verificar Node.js
node --version

# Verificar npm
npm --version

# Verificar servidor
npm run dev

# Verificar que Firebase está configurado
curl http://localhost:5000/
```

---

## ¿ALGO NO FUNCIONA?

1. ¿Ves el servidor ejecutándose en puerto 5000?
   - Si NO: Verifica que no haya otro proceso en puerto 5000
   - Ejecuta: npm run dev

2. ¿Obtienes error "serviceAccountKey.json not found"?
   - El archivo debe estar en la raíz del backend
   - Verifica el nombre: serviceAccountKey.json (sin espacios)

3. ¿Error en registro/login?
   - Verifica que .env esté correctamente configurado
   - Verifica que Firebase project está creado y habilitado

4. ¿Turno no se puede agendar?
   - ¿Has establecido horarios? (POST /servicios/horarios)
   - ¿La hora está dentro del rango? (09:00-17:00)
   - ¿Es un lunes o martes? (esos días tienen horarios)

---

**¡Ahora a completar los checkboxes y hacer que todo funcione! ✓**
