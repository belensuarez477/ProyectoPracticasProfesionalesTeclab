# ESTRUCTURA DEL PROYECTO

```
backend/
├── controllers/
│   ├── authController.js          # Autenticación (registro, login)
│   ├── serviciosController.js     # Gestión de servicios y horarios
│   └── turnosController.js        # Gestión de turnos
├── middleware/
│   └── authMiddleware.js          # Verificación de tokens y roles
├── routes/
│   ├── authRoutes.js              # Rutas de autenticación
│   ├── serviciosRoutes.js         # Rutas de servicios
│   └── turnosRoutes.js            # Rutas de turnos
├── models/
│   └── database-schema.js         # Esquema de la base de datos
├── tests/
│   └── ejemplos-pruebas.js        # Ejemplos de pruebas
├── firebase-config.js             # Configuración de Firebase
├── server.js                      # Servidor principal (Express)
├── package.json                   # Dependencias del proyecto
├── .env                           # Variables de entorno
├── .gitignore                     # Archivos ignorados en git
├── GUIA_FIREBASE.md               # Guía completa
└── README.md                      # Este archivo
```

## FLUJO DE DATOS

### Autenticación
```
Usuario → POST /auth/registro → Firebase Auth + Firestore (users)
Usuario → POST /auth/login → Firebase Auth → Token JWT
Token → Middleware verificarToken → Acceso a endpoints protegidos
```

### Servicios (Profesionales)
```
Profesional → POST /servicios → Crear servicio
Profesional → POST /servicios/horarios → Establecer horarios por día
Cliente → GET /servicios/profesional/{id} → Ver servicios disponibles
```

### Turnos (Clientes)
```
Cliente → POST /turnos → Solicitar turno (estado: pendiente)
Profesional → PUT /turnos/{id}/confirmar → Confirmar turno
Cliente → GET /turnos/cliente/mis-turnos → Ver sus turnos confirmados
Profesional → GET /turnos/profesional/mis-turnos → Ver sus turnos
```

## SEGURIDAD

1. **Autenticación**: Firebase Authentication (correo/contraseña)
2. **Tokens**: JWT generados por Firebase Admin SDK
3. **Autorización**: Middlewares verifican tipo de usuario (profesional/cliente)
4. **Validaciones**:
   - Horarios: Verificación de disponibilidad por día de semana
   - Conflictos: Prevención de turnos superpuestos
   - Permisos: Solo propios usuarios pueden ver/editar sus datos

## BASES DE DATOS

### Firestore (NoSQL)
- **Colecciones**: users, turnos
- **Subcolecciones**: servicios, horarios
- **Ventajas**: 
  - Escalable
  - Queries en tiempo real
  - Fácil de usar con Firebase Auth

### Firebase Authentication
- **Métodos**: Email/Contraseña (configurable con Google, Facebook, etc.)
- **Gestión**: Automática de contraseñas y tokens

## PASOS RÁPIDOS

1. **Configurar Firebase**
   - Crear proyecto en https://console.firebase.google.com
   - Habilitar Authentication (Email/Password)
   - Crear Firestore Database
   - Descargar serviceAccountKey.json

2. **Copiar archivo de credenciales**
   ```bash
   # Coloca el serviceAccountKey.json descargado en la raíz del backend
   ```

3. **Instalar dependencias**
   ```bash
   npm install
   ```

4. **Configurar .env**
   ```
   PORT=5000
   FIREBASE_DATABASE_URL=tu_url_firebase
   ```

5. **Ejecutar servidor**
   ```bash
   npm run dev
   ```

6. **Probar la API**
   - Usar Postman o curl
   - Ver ejemplos en GUIA_FIREBASE.md
