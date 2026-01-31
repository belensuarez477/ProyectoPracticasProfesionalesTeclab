// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { isFirebaseInitialized } = require('./firebase-config');

const authRoutes = require('./routes/authRoutes');
const serviciosRoutes = require('./routes/serviciosRoutes');
const turnosRoutes = require('./routes/turnosRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get('/', (req, res) => {
  res.status(200).json({
    mensaje: 'Bienvenido a la API de Gestión de Servicios Estéticos',
    version: '1.0.0',
    firebaseStatus: isFirebaseInitialized ? '✅ Inicializado' : '⚠️ En modo demo (sin Firebase)',
    endpoints: {
      auth: '/auth',
      servicios: '/servicios',
      turnos: '/turnos'
    }
  });
});

// Rutas de la API
app.use('/auth', authRoutes);
app.use('/servicios', serviciosRoutes);
app.use('/turnos', turnosRoutes);

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Error interno del servidor',
    mensaje: err.message
  });
});

// Ruta 404
app.use((req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✓ Servidor ejecutándose en puerto ${PORT}`);
  console.log(`✓ API disponible en http://localhost:${PORT}`);
  console.log(`✓ CORS habilitado`);
});

module.exports = app;
