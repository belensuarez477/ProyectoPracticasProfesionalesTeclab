// controllers/turnosController.js
const { db, admin, isFirebaseInitialized } = require('../firebase-config');

/**
 * AGENDAR UN TURNO (cliente solicita un turno)
 */
exports.agendarTurno = async (req, res) => {
  try {
    if (!isFirebaseInitialized) {
      return res.status(503).json({ 
        error: 'Firebase no está inicializado',
        mensaje: 'Por favor, configura serviceAccountKey.json para usar esta funcionalidad',
        instrucciones: 'Ve a Firebase Console > Configuración > Cuentas de Servicio > Generar clave privada'
      });
    }

    const clienteId = req.user.uid;
    const { profesionalId, servicioId, fecha, hora, notas, clienteNombre } = req.body;

    if (!profesionalId || !servicioId || !fecha || !hora) {
      return res.status(400).json({ 
        error: 'profesionalId, servicioId, fecha y hora son requeridos' 
      });
    }

    // Obtener el servicio para validar duración y precio
    const servicioDoc = await db
      .collection('users')
      .doc(profesionalId)
      .collection('servicios')
      .doc(servicioId)
      .get();

    if (!servicioDoc.exists) {
      return res.status(404).json({ 
        error: 'Servicio no encontrado' 
      });
    }

    const servicio = servicioDoc.data();

    // Verificar disponibilidad del horario
    const [year, month, day] = String(fecha).split('-').map(Number);
    const fechaObj = new Date(year, month - 1, day);
    const diaSemana = obtenerDiaSemana(fechaObj);
    const diaKey = normalizarDia(diaSemana);

    let horarioDoc = await db
      .collection('users')
      .doc(profesionalId)
      .collection('servicios')
      .doc(servicioId)
      .collection('horarios')
      .doc(diaKey)
      .get();

    if (!horarioDoc.exists && diaKey !== diaSemana) {
      horarioDoc = await db
        .collection('users')
        .doc(profesionalId)
        .collection('servicios')
        .doc(servicioId)
        .collection('horarios')
        .doc(diaSemana)
        .get();
    }

    if (!horarioDoc.exists || !horarioDoc.data().disponible) {
      const horariosSnapshot = await db
        .collection('users')
        .doc(profesionalId)
        .collection('servicios')
        .doc(servicioId)
        .collection('horarios')
        .get();

      const horarioAlternativo = horariosSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .find(h => {
          const diaData = normalizarDia(h.dia || h.diaKey || h.id);
          return diaData === diaKey && h.disponible !== false;
        });

      if (horarioAlternativo) {
        horarioDoc = { data: () => horarioAlternativo };
      } else {
        return res.status(400).json({ 
          error: `El servicio no está disponible el ${diaSemana}` 
        });
      }
    }

    // Verificar que la hora está dentro del rango
    const horario = horarioDoc.data();
    if (hora < horario.horaInicio || hora > horario.horaFin) {
      return res.status(400).json({ 
        error: `La hora debe estar entre ${horario.horaInicio} y ${horario.horaFin}` 
      });
    }

    // Verificar que no hay conflicto con otro turno
    const turnosExistentes = await db
      .collection('turnos')
      .where('profesionalId', '==', profesionalId)
      .where('fecha', '==', admin.firestore.Timestamp.fromDate(fechaObj))
      .where('estado', 'in', ['confirmado', 'pendiente'])
      .get();

    const conflicto = turnosExistentes.docs.some(doc => {
      const turnoExistente = doc.data();
      return tieneSuperposicion(hora, servicio.duracion, turnoExistente.hora, turnoExistente.duracion);
    });

    if (conflicto) {
      return res.status(400).json({ 
        error: 'Hay un conflicto con otro turno en ese horario' 
      });
    }

    // Crear el turno
    const turnoRef = db.collection('turnos').doc();

    // Obtener datos del cliente
    const clienteDoc = await db.collection('users').doc(clienteId).get();
    const clienteData = clienteDoc.exists ? clienteDoc.data() : {};
    const nombreClienteFinal = (clienteNombre || '').trim() || `${clienteData.nombre || 'Cliente'} ${clienteData.apellido || ''}`.trim();

    await turnoRef.set({
      turnoId: turnoRef.id,
      profesionalId: profesionalId,
      clienteId: clienteId,
      clienteNombre: nombreClienteFinal,
      servicioId: servicioId,
      servicioNombre: servicio.nombre,
      fecha: admin.firestore.Timestamp.fromDate(fechaObj),
      hora: hora,
      duracion: servicio.duracion,
      estado: 'pendiente', // El profesional debe confirmar
      precioFinal: servicio.precio,
      notas: notas || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(201).json({
      exito: true,
      mensaje: 'Turno solicitado exitosamente',
      turnoId: turnoRef.id,
      estado: 'pendiente'
    });

  } catch (error) {
    console.error('Error agendando turno:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * OBTENER TURNO
 */
exports.obtenerTurno = async (req, res) => {
  try {
    const { turnoId } = req.params;

    const turnoDoc = await db.collection('turnos').doc(turnoId).get();

    if (!turnoDoc.exists) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    res.status(200).json({
      turno: turnoDoc.data()
    });

  } catch (error) {
    console.error('Error obteniendo turno:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * OBTENER TURNOS DEL PROFESIONAL (filtrar por estado)
 */
exports.obtenerTurnosProfesional = async (req, res) => {
  try {
    const profesionalId = req.user.uid;
    const { estado } = req.query;

    let query = db
      .collection('turnos')
      .where('profesionalId', '==', profesionalId);

    if (estado) {
      query = query.where('estado', '==', estado);
    }

    // Removed .orderBy('fecha', 'asc') to avoid requiring Firestore index
    const turnosSnapshot = await query.get();

    // Sort in JavaScript instead
    const turnos = turnosSnapshot.docs
      .map(doc => doc.data())
      .sort((a, b) => {
        const fechaA = a.fecha?.toDate() || new Date(0);
        const fechaB = b.fecha?.toDate() || new Date(0);
        return fechaA.getTime() - fechaB.getTime();
      });

    res.status(200).json({
      exito: true,
      turnos: turnos
    });

  } catch (error) {
    console.error('Error obteniendo turnos del profesional:', error);
    res.status(500).json({ 
      exito: false,
      error: error.message 
    });
  }
};

/**
 * OBTENER TURNOS DEL CLIENTE
 */
exports.obtenerTurnosCliente = async (req, res) => {
  try {
    const clienteId = req.user.uid;
    const { estado } = req.query;

    let query = db
      .collection('turnos')
      .where('clienteId', '==', clienteId);

    if (estado) {
      query = query.where('estado', '==', estado);
    }

    // Removed .orderBy('fecha', 'asc') to avoid requiring Firestore index
    const turnosSnapshot = await query.get();

    // Sort in JavaScript instead
    const turnos = turnosSnapshot.docs
      .map(doc => doc.data())
      .sort((a, b) => {
        const fechaA = a.fecha?.toDate() || new Date(0);
        const fechaB = b.fecha?.toDate() || new Date(0);
        return fechaA.getTime() - fechaB.getTime();
      });

    res.status(200).json({
      exito: true,
      turnos: turnos
    });

  } catch (error) {
    console.error('Error obteniendo turnos del cliente:', error);
    res.status(500).json({ 
      exito: false,
      error: error.message 
    });
  }
};

/**
 * CONFIRMAR TURNO (profesional confirma la solicitud)
 */
exports.confirmarTurno = async (req, res) => {
  try {
    const profesionalId = req.user.uid;
    const { turnoId } = req.params;
    const { precioFinal } = req.body;

    const turnoDoc = await db.collection('turnos').doc(turnoId).get();

    if (!turnoDoc.exists) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    const turno = turnoDoc.data();

    if (turno.profesionalId !== profesionalId) {
      return res.status(403).json({ 
        error: 'No tienes permiso para confirmar este turno' 
      });
    }

    const actualizaciones = {
      estado: 'confirmado',
      confirmadoEn: admin.firestore.FieldValue.serverTimestamp()
    };

    if (precioFinal) {
      actualizaciones.precioFinal = parseFloat(precioFinal);
    }

    await db.collection('turnos').doc(turnoId).update(actualizaciones);

    res.status(200).json({
      mensaje: 'Turno confirmado exitosamente'
    });

  } catch (error) {
    console.error('Error confirmando turno:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * CANCELAR TURNO
 */
exports.cancelarTurno = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { turnoId } = req.params;
    const { motivo } = req.body;

    const turnoDoc = await db.collection('turnos').doc(turnoId).get();

    if (!turnoDoc.exists) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    const turno = turnoDoc.data();

    // Verificar que sea el cliente o profesional del turno
    if (uid !== turno.clienteId && uid !== turno.profesionalId) {
      return res.status(403).json({ 
        error: 'No tienes permiso para cancelar este turno' 
      });
    }

    await db.collection('turnos').doc(turnoId).update({
      estado: 'cancelado',
      motivoCancelacion: motivo || '',
      canceladoEn: admin.firestore.FieldValue.serverTimestamp()
    });

    res.status(200).json({
      mensaje: 'Turno cancelado exitosamente'
    });

  } catch (error) {
    console.error('Error cancelando turno:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * ACTUALIZAR ASISTENCIA DEL TURNO (solo profesional)
 */
exports.actualizarAsistencia = async (req, res) => {
  try {
    const profesionalId = req.user.uid;
    const { turnoId } = req.params;
    const { estadoAsistencia } = req.body;

    const estadosValidos = ['presente', 'ausente', 'cancelado', 'reprogramado'];
    if (!estadoAsistencia || !estadosValidos.includes(estadoAsistencia)) {
      return res.status(400).json({
        error: 'estadoAsistencia inválido'
      });
    }

    const turnoDoc = await db.collection('turnos').doc(turnoId).get();

    if (!turnoDoc.exists) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    const turno = turnoDoc.data();

    if (turno.profesionalId !== profesionalId) {
      return res.status(403).json({
        error: 'No tienes permiso para actualizar este turno'
      });
    }

    const actualizaciones = {
      estadoAsistencia: estadoAsistencia,
      asistenciaActualizadaEn: admin.firestore.FieldValue.serverTimestamp()
    };

    if (estadoAsistencia === 'cancelado') {
      actualizaciones.estado = 'cancelado';
    }

    await db.collection('turnos').doc(turnoId).update(actualizaciones);

    res.status(200).json({
      mensaje: 'Asistencia actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error actualizando asistencia:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * FUNCIONES AUXILIARES
 */

// Obtener nombre del día de la semana (lunes, martes, etc)
function obtenerDiaSemana(fecha) {
  const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  return dias[fecha.getDay()];
}

// Normaliza el nombre del día para usarlo como clave de documento
function normalizarDia(dia) {
  return String(dia || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Verificar si hay superposición entre dos turnos
function tieneSuperposicion(hora1, duracion1, hora2, duracion2) {
  const [h1, m1] = hora1.split(':').map(Number);
  const [h2, m2] = hora2.split(':').map(Number);

  const minutos1 = h1 * 60 + m1;
  const minutos2 = h2 * 60 + m2;

  const fin1 = minutos1 + duracion1;
  const fin2 = minutos2 + duracion2;

  return !(fin1 <= minutos2 || fin2 <= minutos1);
}
