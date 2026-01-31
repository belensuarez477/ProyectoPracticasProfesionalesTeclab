// routes/serviciosRoutes.js
const express = require('express');
const router = express.Router();
const serviciosController = require('../controllers/serviciosController');
const { verificarToken, verificarProfesional } = require('../middleware/authMiddleware');

/**
 * POST /servicios
 * Crea un nuevo servicio (solo profesionales)
 * Headers: Authorization: Bearer token
 * Body: { nombre, descripcion, precio, duracion }
 */
router.post(
  '/',
  verificarToken,
  verificarProfesional,
  serviciosController.crearServicio
);

/**
 * POST /servicios/horarios
 * Establece horarios disponibles para un servicio
 * Headers: Authorization: Bearer token
 * Body: { servicioId, horarios: [{ dia, horaInicio, horaFin, disponible }] }
 */
router.post(
  '/horarios',
  verificarToken,
  verificarProfesional,
  serviciosController.establecerHorarios
);

/**
 * GET /servicios
 * Obtiene los servicios del profesional autenticado
 * Headers: Authorization: Bearer token
 */
router.get(
  '/',
  verificarToken,
  verificarProfesional,
  serviciosController.obtenerServicios
);

/**
 * PUT /servicios/:servicioId
 * Actualiza un servicio
 * Headers: Authorization: Bearer token
 * Body: { nombre, descripcion, precio, duracion }
 */
router.put(
  '/:servicioId',
  verificarToken,
  verificarProfesional,
  serviciosController.actualizarServicio
);

/**
 * DELETE /servicios/:servicioId
 * Elimina un servicio
 * Headers: Authorization: Bearer token
 */
router.delete(
  '/:servicioId',
  verificarToken,
  verificarProfesional,
  serviciosController.eliminarServicio
);

/**
 * GET /servicios/profesional/:profesionalId
 * Obtiene los servicios de un profesional (vista pública)
 */
router.get(
  '/profesional/:profesionalId',
  serviciosController.obtenerServiciosProfesional
);

module.exports = router;
