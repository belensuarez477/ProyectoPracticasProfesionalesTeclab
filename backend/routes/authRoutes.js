// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken } = require('../middleware/authMiddleware');

/**
 * POST /auth/registro
 * Registra un nuevo usuario
 * Body: { email, password, nombre, apellido, telefono, tipoUsuario }
 */
router.post('/registro', authController.registro);

/**
 * POST /auth/login
 * Inicia sesión
 * Body: { email, password }
 */
router.post('/login', authController.login);

/**
 * GET /auth/perfil
 * Obtiene el perfil del usuario autenticado
 * Headers: Authorization: Bearer token
 */
router.get('/perfil', verificarToken, authController.obtenerPerfil);

/**
 * PUT /auth/perfil
 * Actualiza el perfil del usuario autenticado
 * Headers: Authorization: Bearer token
 * Body: { nombre, apellido, telefono, fotoPerfil }
 */
router.put('/perfil', verificarToken, authController.actualizarPerfil);

/**
 * POST /auth/logout
 * Cierra la sesión
 */
router.post('/logout', authController.logout);

module.exports = router;
