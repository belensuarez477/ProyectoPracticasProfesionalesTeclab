# DIAGRAMAS DE LA ARQUITECTURA

## DIAGRAMA 1: Flujo de Registro e Inicio de Sesión

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENTE (Frontend)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
   POST /auth/registro           POST /auth/login
        │                             │
        └──────────────┬──────────────┘
                       ▼
        ┌──────────────────────────────┐
        │   Backend (Express.js)       │
        └──────────┬───────────────────┘
                   │
        ┌──────────┴──────────┐
        ▼                     ▼
   ┌─────────────┐      ┌──────────────┐
   │ Firebase    │      │  Firestore   │
   │ Auth        │      │  Database    │
   │             │      │              │
   │ Email       │      │ users/       │
   │ Password    │      │ servicios/   │
   │ Validación  │      │ turnos/      │
   └─────────────┘      └──────────────┘
        │                     │
        └──────────────┬──────┘
                       ▼
           Retorna: Token JWT + Datos Usuario
```

## DIAGRAMA 2: Estructura de Colecciones en Firestore

```
Firestore Database
│
├── users/
│   ├── user123/
│   │   ├── uid: "user123"
│   │   ├── email: "profesional@example.com"
│   │   ├── nombre: "María"
│   │   ├── tipoUsuario: "profesional"
│   │   │
│   │   └── servicios/ (subcolección)
│   │       ├── serv001/
│   │       │   ├── nombre: "Limpieza Facial"
│   │       │   ├── precio: 35.00
│   │       │   ├── duracion: 60
│   │       │   │
│   │       │   └── horarios/ (subcolección)
│   │       │       ├── lunes/
│   │       │       │   ├── horaInicio: "09:00"
│   │       │       │   ├── horaFin: "17:00"
│   │       │       │   └── disponible: true
│   │       │       ├── martes/ { ... }
│   │       │       └── miércoles/ { ... }
│   │       │
│   │       └── serv002/ (Depilación, etc.)
│   │
│   └── user456/
│       ├── uid: "user456"
│       ├── email: "cliente@example.com"
│       ├── nombre: "Juan"
│       └── tipoUsuario: "cliente"
│
└── turnos/
    ├── turno001/
    │   ├── turnoId: "turno001"
    │   ├── profesionalId: "user123"
    │   ├── clienteId: "user456"
    │   ├── servicioId: "serv001"
    │   ├── fecha: "2026-02-10"
    │   ├── hora: "10:00"
    │   ├── estado: "confirmado"
    │   └── precioFinal: 35.00
    │
    └── turno002/ { ... }
```

## DIAGRAMA 3: Flujo de Agendar Turno

```
CLIENTE                    BACKEND                    FIREBASE
│                          │                          │
├─ POST /turnos ────────────►│                         │
│  {profesionalId,          │                         │
│   servicioId,             │                         │
│   fecha: "2026-02-10",    │                         │
│   hora: "10:00"}          │                         │
│                           │                         │
│                      ┌────► 1. Validar servicio ────► Firestore
│                      │       (obtener duración)       (users/{pid}/servicios/{sid})
│                      │                               │
│                      ├────► 2. Validar horarios ────► Firestore
│                      │       (miércoles disponible?) (horarios)
│                      │                               │
│                      ├────► 3. Buscar conflictos ───► Firestore
│                      │       (turnos superpuestos)   (turnos)
│                      │                               │
│                      ├─ Si todo está OK:
│                      │  CREATE turno ───────────────► Firestore
│                      │  (estado: "pendiente")         (turnos)
│                      │                               │
│◄─────────────────────┤─ Respuesta:
  {turnoId, estado}     │  turnoId, estado:"pendiente"
                        │
                   Esperar confirmación del PROFESIONAL
                        │
PROFESIONAL            │                          │
├─ PUT /turnos/{id}    │                          │
│  /confirmar ──────────►│                         │
│  {precioFinal}        │                         │
│                       ├─ UPDATE turno ────────► Firestore
│                       │  estado: "confirmado"   (turnos/{id})
│                       │                        │
│◄──────────────────────┤ Confirmado
  Turno confirmado      │
```

## DIAGRAMA 4: Matriz de Permisos

```
                 Registro  Login  Ver Perfil  Crear Servicio  Agendar Turno  Ver Turnos
Anónimo             ✓       ✓        ✗              ✗               ✗            ✗
Cliente (Auth)      -       -        ✓              ✗               ✓            ✓*
Profesional (Auth)  -       -        ✓              ✓               ✗            ✓**

* Cliente solo ve sus propios turnos
** Profesional solo ve sus propios turnos
```

## DIAGRAMA 5: Ciclo de Vida de un Turno

```
PENDIENTE (solicitado por cliente)
    │
    ├─ Profesional confirma ──┐
    │                         ▼
    │                    CONFIRMADO (listo para atender)
    │                         │
    │                         ├─ Se atiende el turno
    │                         │  (en la fecha/hora programada)
    │                         │
    │                         └─ Marcado como completado
    │
    └─ Cliente/Profesional cancela
                       │
                       ▼
                   CANCELADO (no se realizará)
```

## DIAGRAMA 6: Validación de Horarios

```
Profesional establece:
├─ LUNES: 09:00 - 17:00 (Limpieza Facial)
├─ MARTES: 09:00 - 17:00 (Limpieza Facial)
└─ MIÉRCOLES: 10:00 - 14:00 (Depilación)

Cliente intenta agendar:
├─ Lunes 10:00 para Limpieza (60 min) ────► ✓ Válido
│  (dentro de 09:00-17:00, y no hay conflicto)
│
├─ Martes 15:00 para Limpieza (60 min) ──► ✓ Válido
│  (dentro de 09:00-17:00, y no hay conflicto)
│
├─ Miércoles 10:00 para Limpieza (60 min)─► ✗ Inválido
│  (No disponible para ese servicio)
│
└─ Miércoles 10:00 para Depilación (90 min) ─► ✓ Válido
   (dentro de 10:00-14:00, y no hay conflicto)
```

## DIAGRAMA 7: Rutas de la API

```
┌─────────────────────────────────────────────────────────────┐
│                    API ENDPOINTS                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ AUTENTICACIÓN (/auth)                                       │
│ ├─ POST   /registro          ► Registrar usuario            │
│ ├─ POST   /login             ► Iniciar sesión              │
│ ├─ GET    /perfil            ► Obtener perfil (protegido)  │
│ ├─ PUT    /perfil            ► Actualizar perfil           │
│ └─ POST   /logout            ► Cerrar sesión               │
│                                                              │
│ SERVICIOS (/servicios)                                      │
│ ├─ POST   /                  ► Crear servicio (prof.)      │
│ ├─ POST   /horarios          ► Establecer horarios (prof.) │
│ ├─ GET    /                  ► Obtener mis servicios       │
│ ├─ PUT    /{id}              ► Actualizar servicio         │
│ ├─ DELETE /{id}              ► Eliminar servicio           │
│ └─ GET    /profesional/{id}  ► Ver servicios de otro       │
│                                                              │
│ TURNOS (/turnos)                                            │
│ ├─ POST   /                  ► Agendar turno (cliente)     │
│ ├─ GET    /{id}              ► Ver detalles turno          │
│ ├─ GET    /profesional/...   ► Mis turnos (profesional)    │
│ ├─ GET    /cliente/...       ► Mis turnos (cliente)        │
│ ├─ PUT    /{id}/confirmar    ► Confirmar turno (prof.)     │
│ └─ PUT    /{id}/cancelar     ► Cancelar turno              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```
