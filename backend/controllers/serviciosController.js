// controllers/serviciosController.js
const { db, admin, isFirebaseInitialized } = require('../firebase-config');

/**
 * CREAR UN SERVICIO (para profesionales)
 * Ejemplo: "Limpieza Facial", "Depilación", etc.
 */
exports.crearServicio = async (req, res) => {
  try {
    if (!isFirebaseInitialized) {
      return res.status(503).json({ 
        error: 'Firebase no está inicializado',
        mensaje: 'Por favor, configura serviceAccountKey.json',
        instrucciones: 'Ve a Firebase Console > Configuración > Cuentas de Servicio > Generar clave privada'
      });
    }

    const uid = req.user.uid;
    const { nombre, descripcion, precio, duracion } = req.body;

    if (!nombre || !precio || !duracion) {
      return res.status(400).json({ 
        error: 'Nombre, precio y duración son requeridos' 
      });
    }

    // Verificar que sea un usuario profesional
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.data().tipoUsuario !== 'profesional') {
      return res.status(403).json({ 
        error: 'Solo los profesionales pueden crear servicios' 
      });
    }

    // Crear el servicio en la subcolección de usuarios
    const servicioRef = db
      .collection('users')
      .doc(uid)
      .collection('servicios')
      .doc();

    await servicioRef.set({
      servicioId: servicioRef.id,
      nombre: nombre,
      descripcion: descripcion || '',
      precio: parseFloat(precio),
      duracion: parseInt(duracion), // en minutos
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      estado: 'activo'
    });

    res.status(201).json({
      exito: true,
      mensaje: 'Servicio creado exitosamente',
      servicioId: servicioRef.id
    });

  } catch (error) {
    console.error('Error creando servicio:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * ESTABLECER HORARIOS DISPONIBLES PARA UN SERVICIO
 * Por día de la semana, define en qué horarios el profesional puede atender ese servicio
 */
exports.establecerHorarios = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { servicioId, horarios } = req.body;

    // horarios es un array de:
    // { dia: "lunes", horaInicio: "09:00", horaFin: "17:00", disponible: true }

    if (!servicioId || !horarios || !Array.isArray(horarios)) {
      return res.status(400).json({ 
        error: 'servicioId y horarios (array) son requeridos' 
      });
    }

    const batch = db.batch();

    for (const horario of horarios) {
      const horarioRef = db
        .collection('users')
        .doc(uid)
        .collection('servicios')
        .doc(servicioId)
        .collection('horarios')
        .doc(horario.dia);

      batch.set(horarioRef, {
        dia: horario.dia,
        horaInicio: horario.horaInicio,
        horaFin: horario.horaFin,
        disponible: horario.disponible !== false,
        actualizadoEn: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    await batch.commit();

    res.status(200).json({
      exito: true,
      mensaje: 'Horarios establecidos exitosamente'
    });

  } catch (error) {
    console.error('Error estableciendo horarios:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * OBTENER SERVICIOS DEL PROFESIONAL
 */
exports.obtenerServicios = async (req, res) => {
  try {
    const uid = req.user.uid;

    const serviciosSnapshot = await db
      .collection('users')
      .doc(uid)
      .collection('servicios')
      .get();

    const servicios = [];
    for (const doc of serviciosSnapshot.docs) {
      const servicio = doc.data();
      
      // Obtener horarios de cada servicio
      const horariosSnapshot = await db
        .collection('users')
        .doc(uid)
        .collection('servicios')
        .doc(doc.id)
        .collection('horarios')
        .get();

      const horarios = horariosSnapshot.docs.map(h => h.data());

      servicios.push({
        id: doc.id, // Agregar el ID del documento de Firestore
        ...servicio,
        horarios: horarios
      });
    }

    res.status(200).json({
      exito: true,
      servicios: servicios
    });

  } catch (error) {
    console.error('Error obteniendo servicios:', error);
    res.status(500).json({ 
      exito: false,
      error: error.message 
    });
  }
};

/**
 * ACTUALIZAR SERVICIO
 */
exports.actualizarServicio = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { servicioId } = req.params;
    const { nombre, descripcion, precio, duracion } = req.body;

    const actualizaciones = {};
    if (nombre) actualizaciones.nombre = nombre;
    if (descripcion) actualizaciones.descripcion = descripcion;
    if (precio) actualizaciones.precio = parseFloat(precio);
    if (duracion) actualizaciones.duracion = parseInt(duracion);

    await db
      .collection('users')
      .doc(uid)
      .collection('servicios')
      .doc(servicioId)
      .update(actualizaciones);

    res.status(200).json({
      mensaje: 'Servicio actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando servicio:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * ELIMINAR SERVICIO
 */
exports.eliminarServicio = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { servicioId } = req.params;

    await db
      .collection('users')
      .doc(uid)
      .collection('servicios')
      .doc(servicioId)
      .delete();

    res.status(200).json({
      mensaje: 'Servicio eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando servicio:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * OBTENER SERVICIOS DE UN PROFESIONAL (vista pública para clientes)
 */
exports.obtenerServiciosProfesional = async (req, res) => {
  try {
    const { profesionalId } = req.params;

    const serviciosSnapshot = await db
      .collection('users')
      .doc(profesionalId)
      .collection('servicios')
      .where('estado', '==', 'activo')
      .get();

    const servicios = [];
    for (const doc of serviciosSnapshot.docs) {
      const servicio = doc.data();
      
      const horariosSnapshot = await db
        .collection('users')
        .doc(profesionalId)
        .collection('servicios')
        .doc(doc.id)
        .collection('horarios')
        .where('disponible', '==', true)
        .get();

      const horarios = horariosSnapshot.docs.map(h => h.data());

      servicios.push({
        ...servicio,
        horarios: horarios
      });
    }

    res.status(200).json({
      servicios: servicios
    });

  } catch (error) {
    console.error('Error obteniendo servicios del profesional:', error);
    res.status(500).json({ error: error.message });
  }
};
