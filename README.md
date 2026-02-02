# ProyectoPracticasProfesionalesTeclab
Prácticas profesionales en forma de voluntariado para la tecnicatura superior en programación.

## Requisitos
- Node.js 18+ (recomendado)
- NPM
- Cuenta y proyecto de Firebase (para Auth + Firestore)

## Descarga e instalación
1. Cloná el repositorio.
2. Instalá dependencias del backend:
	- Ir a la carpeta backend
	- Ejecutar: npm install
3. Instalá dependencias del frontend:
	- Ir a la carpeta frontend/beautysystemPage
	- Ejecutar: npm install

## Configuración de Firebase (backend)
1. Generá una clave de cuenta de servicio en Firebase Console.
2. Guardala como backend/serviceAccountKey.json (o usá el archivo provisto si ya está configurado).
3. Verificá que backend/firebase-config.js apunte a esa clave.

## Ejecutar el proyecto
### Backend
- Ir a backend
- Ejecutar: npm start
- API disponible en http://localhost:5000

### Frontend
- Ir a frontend/beautysystemPage
- Ejecutar: ng serve
- App disponible en http://localhost:4200

## Pruebas
### Prueba API y base de datos
- Ir a backend
- Ejecutar: npm test

### Prueba de horarios
- Ir a backend
- Ejecutar: npm run test:horarios

## Estructura del proyecto
- backend: API Node.js + Express + Firebase
- frontend/beautysystemPage: App Angular

## Notas
- Si el puerto 5000 está ocupado, detené el proceso previo o cambiá el puerto en el backend.
- Si el frontend no conecta, verificá que el backend esté corriendo.
