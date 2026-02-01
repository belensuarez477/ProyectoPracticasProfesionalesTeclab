# 🧪 Prueba Manual - Frontend + Backend

## Preparación

### 1️⃣ Iniciar el Backend
```powershell
cd backend
npm start
```
✅ Deberías ver: `Servidor corriendo en http://localhost:5000`

### 2️⃣ Iniciar el Frontend (en otra terminal)
```powershell
cd frontend/beautysystemPage
npm start
```
✅ Deberías ver: `Application bundle generation complete`
✅ Navegar a: http://localhost:4200

---

## 🔍 Prueba 1: Verificar Backend

**Objetivo:** Confirmar que el servidor backend responde

1. Abre tu navegador
2. Ve a: http://localhost:5000
3. **Resultado esperado:** Deberías ver un JSON como:
```json
{
  "mensaje": "Bienvenido a la API de Gestión de Servicios Estéticos",
  "version": "1.0.0",
  "firebaseStatus": "✅ Inicializado",
  "endpoints": {
    "auth": "/auth",
    "servicios": "/servicios",
    "turnos": "/turnos"
  }
}
```

✅ **Si ves esto, el backend funciona correctamente**

---

## 🔍 Prueba 2: Registro de Usuario Profesional

**Objetivo:** Crear una cuenta profesional desde el frontend

1. Ve a: http://localhost:4200
2. Haz clic en el botón **"Registrarse"** (o similar en el navbar)
3. Completa el formulario:
   - **Nombre:** Juan
   - **Apellido:** Pérez
   - **Email:** juan@test.com
   - **Teléfono:** 1234567890
   - **Tipo de Usuario:** **Profesional** ⬅️ IMPORTANTE
   - **Contraseña:** 123456
   - **Confirmar Contraseña:** 123456
4. Presiona **"Crear Cuenta"**

### Verificar:
- **Abre DevTools (F12)** > Pestaña **Network** (Red)
- Busca la petición `registro`
- Haz clic en ella y ve a la pestaña **Response**

**Resultado esperado:**
```json
{
  "exito": true,
  "mensaje": "Usuario registrado exitosamente",
  "token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "abc123...",
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@test.com",
    "tipoUsuario": "profesional"
  }
}
```

✅ **Si ves `"exito": true`, el registro funcionó**

---

## 🔍 Prueba 3: Login con Usuario Registrado

**Objetivo:** Iniciar sesión con el usuario creado

1. Si fuiste redirigido automáticamente al login, salta al paso 3
2. Si no, haz clic en **"Iniciar Sesión"** en el navbar
3. Ingresa:
   - **Email:** juan@test.com
   - **Contraseña:** 123456
4. Presiona **"Iniciar Sesión"**

### Verificar:
- **DevTools (F12)** > **Network** > petición `login`
- Deberías ser redirigido a `/dashboard`

**Resultado esperado:**
- Ves tu dashboard con tu nombre: "Juan Pérez"
- Hay pestañas: "Mi Perfil", "Mis Turnos", "Mis Servicios"

✅ **Si ves el dashboard, el login funcionó**

---

## 🔍 Prueba 4: Ver Mi Perfil

**Objetivo:** Verificar que los datos del usuario se muestren correctamente

1. Estando en el dashboard, asegúrate de estar en la pestaña **"Mi Perfil"**
2. Verifica que se muestren:
   - **Nombre:** Juan Pérez
   - **Email:** juan@test.com
   - **Teléfono:** 1234567890
   - **Tipo de Usuario:** Profesional

✅ **Si ves todos tus datos correctamente, la integración funciona**

---

## 🔍 Prueba 5: Crear un Servicio (Solo Profesionales)

**Objetivo:** Crear un servicio y verificar que se guarde en el backend

1. En el dashboard, ve a la pestaña **"Mis Servicios"**
2. Completa el formulario de nuevo servicio:
   - **Nombre:** Corte de Cabello
   - **Duración:** 30 (minutos)
   - **Precio:** 250
3. Presiona **"Agregar Servicio"**

### Verificar:
- **DevTools (F12)** > **Network** > busca petición POST a `/servicios`
- **Request Payload** debe contener los datos del servicio
- **Response** debe ser:
```json
{
  "exito": true,
  "mensaje": "Servicio creado exitosamente",
  "servicio": {
    "id": "xyz789...",
    "profesionalId": "abc123...",
    "nombre": "Corte de Cabello",
    "duracion": 30,
    "precio": 250
  }
}
```

✅ **Si ves `"exito": true`, el servicio fue creado en Firebase**

---

## 🔍 Prueba 6: Registrar un Cliente

**Objetivo:** Crear una cuenta cliente para agendar turnos

1. **Cierra sesión** haciendo clic en "Cerrar Sesión"
2. Haz clic en **"Registrarse"**
3. Completa el formulario:
   - **Nombre:** María
   - **Apellido:** González
   - **Email:** maria@test.com
   - **Teléfono:** 9876543210
   - **Tipo de Usuario:** **Cliente** ⬅️ IMPORTANTE
   - **Contraseña:** 123456
   - **Confirmar Contraseña:** 123456
4. Presiona **"Crear Cuenta"**
5. Inicia sesión con maria@test.com / 123456

✅ **Si puedes iniciar sesión como María, tienes ambos tipos de usuario**

---

## 🔍 Prueba 7: Verificar Token en LocalStorage

**Objetivo:** Confirmar que el token se guarde correctamente

1. Con cualquier usuario logueado, abre **DevTools (F12)**
2. Ve a la pestaña **Application** (o **Almacenamiento**)
3. En el panel izquierdo, expande **Local Storage**
4. Haz clic en `http://localhost:4200`
5. Busca estas claves:
   - `beautysystem_token` → Debe tener un token JWT largo
   - `beautysystem_current_user` → Debe tener un JSON con tus datos

**Ejemplo:**
```
beautysystem_token: eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
beautysystem_current_user: {"id":"abc123","nombre":"Juan","apellido":"Pérez"...}
```

✅ **Si ves ambas claves con datos, la sesión se guarda correctamente**

---

## 🔍 Prueba 8: Verificar Headers de Authorization

**Objetivo:** Confirmar que las peticiones autenticadas incluyan el token

1. Estando logueado, haz alguna acción que requiera autenticación (ej: crear servicio)
2. **DevTools (F12)** > **Network** > Haz clic en la petición
3. Ve a la pestaña **Headers** (Encabezados)
4. Busca en **Request Headers** la línea:
   ```
   Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

✅ **Si ves el header Authorization, las peticiones se autentican correctamente**

---

## 🔍 Prueba 9: Logout y Verificar Limpieza

**Objetivo:** Confirmar que cerrar sesión limpie los datos

1. Estando logueado, haz clic en **"Cerrar Sesión"**
2. Deberías ser redirigido a la página principal
3. Abre **DevTools (F12)** > **Application** > **Local Storage**
4. Verifica que:
   - `beautysystem_token` ya NO existe (o está vacío)
   - `beautysystem_current_user` ya NO existe (o está vacío)

✅ **Si los datos fueron eliminados, el logout funciona correctamente**

---

## 🔍 Prueba 10: Intentar Acceder sin Autenticación

**Objetivo:** Verificar que las rutas protegidas redirijan

1. Asegúrate de NO estar logueado (haz logout si es necesario)
2. Intenta ir directamente a: http://localhost:4200/dashboard
3. **Resultado esperado:** Deberías ser redirigido a la página principal o login

✅ **Si no puedes acceder sin login, la protección funciona**

---

## 📊 Checklist Final

Marca cada prueba que hayas completado exitosamente:

- [ ] ✅ Backend responde en http://localhost:5000
- [ ] ✅ Frontend carga en http://localhost:4200
- [ ] ✅ Registro de profesional funciona
- [ ] ✅ Login funciona y redirige al dashboard
- [ ] ✅ Dashboard muestra datos correctos del usuario
- [ ] ✅ Crear servicio funciona (profesionales)
- [ ] ✅ Registro de cliente funciona
- [ ] ✅ Token se guarda en localStorage
- [ ] ✅ Peticiones incluyen header Authorization
- [ ] ✅ Logout limpia la sesión
- [ ] ✅ Rutas protegidas redirigen sin login

---

## 🐛 Problemas Comunes

### ❌ Error: "Failed to fetch" o "ERR_CONNECTION_REFUSED"
**Solución:** Verifica que el backend esté corriendo en http://localhost:5000

### ❌ Error: "CORS policy"
**Solución:** Reinicia el backend (Ctrl+C y luego `npm start`)

### ❌ Error: "exito: false" al registrar
**Causa:** El email ya está registrado
**Solución:** Usa otro email o verifica en Firebase Console

### ❌ No se redirige después del login
**Solución:** Verifica en DevTools > Console si hay errores
**Alternativa:** Navega manualmente a http://localhost:4200/dashboard

### ❌ "Token inválido" o "No autorizado"
**Solución:** 
1. Haz logout
2. Borra localStorage (DevTools > Application > Clear storage)
3. Vuelve a hacer login

---

## 🎯 Resultado Esperado

Si todas las pruebas pasan:

✅ Frontend y Backend se comunican correctamente
✅ Autenticación funciona (registro, login, logout)
✅ Tokens JWT se generan y validan
✅ Los datos se guardan en Firebase
✅ Las rutas protegidas funcionan
✅ CORS está configurado correctamente

**¡Tu aplicación está funcionando completamente! 🎉**

---

## 📸 Evidencias Sugeridas

Para documentar que todo funciona, toma capturas de:

1. Backend respondiendo en http://localhost:5000
2. Frontend en http://localhost:4200
3. DevTools mostrando petición exitosa de registro
4. Dashboard con tus datos
5. LocalStorage con token y usuario
6. Petición con header Authorization
7. Firebase Console mostrando usuarios y servicios creados

---

¿Encontraste algún problema? Revisa la consola del backend y DevTools del navegador para más detalles.
