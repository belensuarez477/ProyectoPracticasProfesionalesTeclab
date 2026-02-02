// routes/turnosRoutes.js
const express = require('express');
const router = express.Router();
const turnosController = require('../controllers/turnosController');
const { verificarToken, verificarProfesional, verificarCliente } = require('../middleware/authMiddleware');

/**
 * POST /turnos
 * Crea un nuevo turno (cliente solicita un turno)
 * Headers: Authorization: Bearer token
 * Body: { profesionalId, servicioId, fecha, hora, notas }
 */
router.post(
  '/',
  verificarToken,
  turnosController.agendarTurno
);

/**
 * GET /turnos/:turnoId
 * Obtiene los detalles de un turno
 * Headers: Authorization: Bearer token
 */
router.get(
  '/:turnoId',
  verificarToken,
  turnosController.obtenerTurno
);

/**
 * GET /turnos/profesional/mis-turnos
 * Obtiene todos los turnos del profesional autenticado
 * Query: ?estado=confirmado|pendiente|cancelado
 * Headers: Authorization: Bearer token
 */
router.get(
  '/profesional/mis-turnos',
  verificarToken,
  verificarProfesional,
  turnosController.obtenerTurnosProfesional
);

/**
 * GET /turnos/cliente/mis-turnos
 * Obtiene todos los turnos del cliente autenticado
 * Query: ?estado=confirmado|pendiente|cancelado
 * Headers: Authorization: Bearer token
 */
router.get(
  '/cliente/mis-turnos',
  verificarToken,
  verificarCliente,
  turnosController.obtenerTurnosCliente
);

/**
 * PUT /turnos/:turnoId/confirmar
 * Confirma un turno (solo el profesional)
 * Headers: Authorization: Bearer token
 * Body: { precioFinal (opcional) }
 */
router.put(
  '/:turnoId/confirmar',
  verificarToken,
  verificarProfesional,
  turnosController.confirmarTurno
);

/**
 * PUT /turnos/:turnoId/cancelar
 * Cancela un turno
 * Headers: Authorization: Bearer token
 * Body: { motivo (opcional) }
 */
router.put(
  '/:turnoId/cancelar',
  verificarToken,
  turnosController.cancelarTurno
);

/**
 * PUT /turnos/:turnoId/asistencia
 * Actualiza el estado de asistencia del turno (solo profesional)
 * Headers: Authorization: Bearer token
 * Body: { estadoAsistencia: 'presente' | 'ausente' | 'cancelado' | 'reprogramado' }
 */
router.put(
  '/:turnoId/asistencia',
  verificarToken,
  verificarProfesional,
  turnosController.actualizarAsistencia
);

module.exports = router;
