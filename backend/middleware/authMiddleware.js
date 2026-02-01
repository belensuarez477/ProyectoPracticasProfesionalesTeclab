// middleware/authMiddleware.js
const { auth } = require('../firebase-config');
const jwt = require('jsonwebtoken');

// Clave secreta para JWT (debe coincidir con authController)
const JWT_SECRET = process.env.JWT_SECRET || 'beautysystem-secret-key-2024';

/**
 * MIDDLEWARE DE AUTENTICACIÓN
 * Verifica el token JWT y extrae el UID del usuario
 */
exports.verificarToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];

    if (!token) {
      return res.status(401).json({ 
        error: 'Token no proporcionado' 
      });
    }

    // Verificar el token JWT
    const decodedToken = jwt.verify(token, JWT_SECRET);

    // Agregar información del usuario al objeto request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      tipoUsuario: decodedToken.tipoUsuario
    };

    next();

  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(401).json({ 
      error: 'Token inválido o expirado' 
    });
  }
};

/**
 * MIDDLEWARE PARA VERIFICAR QUE ES PROFESIONAL
 */
exports.verificarProfesional = async (req, res, next) => {
  try {
    const { db } = require('../firebase-config');
    const uid = req.user.uid;

    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    if (userDoc.data().tipoUsuario !== 'profesional') {
      return res.status(403).json({ 
        error: 'Esta acción requiere ser un usuario profesional' 
      });
    }

    next();

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * MIDDLEWARE PARA VERIFICAR QUE ES CLIENTE
 */
exports.verificarCliente = async (req, res, next) => {
  try {
    const { db } = require('../firebase-config');
    const uid = req.user.uid;

    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      });
    }

    if (userDoc.data().tipoUsuario !== 'cliente') {
      return res.status(403).json({ 
        error: 'Esta acción requiere ser un usuario cliente' 
      });
    }

    next();

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
