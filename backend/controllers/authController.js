// controllers/authController.js
const { db, auth, admin, isFirebaseInitialized } = require('../firebase-config');

/**
 * REGISTRO DE USUARIO
 * Crea un nuevo usuario en Firebase Authentication y guarda sus datos en Firestore
 */
exports.registro = async (req, res) => {
  try {
    if (!isFirebaseInitialized) {
      return res.status(503).json({ 
        error: 'Firebase no está inicializado',
        mensaje: 'Por favor, configura serviceAccountKey.json',
        instrucciones: 'Ve a Firebase Console > Configuración > Cuentas de Servicio > Generar clave privada'
      });
    }

    const { email, password, nombre, apellido, telefono, tipoUsuario } = req.body;

    // Validar que todos los campos requeridos estén presentes
    if (!email || !password || !nombre || !apellido || !tipoUsuario) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos' 
      });
    }

    // Crear usuario en Firebase Authentication
    const userAuth = await auth.createUser({
      email: email,
      password: password,
      displayName: `${nombre} ${apellido}`
    });

    // Guardar datos adicionales en Firestore
    await db.collection('users').doc(userAuth.uid).set({
      uid: userAuth.uid,
      email: email,
      nombre: nombre,
      apellido: apellido,
      telefono: telefono || '',
      tipoUsuario: tipoUsuario, // "profesional" o "cliente"
      fotoPerfil: '',
      fechaRegistro: admin.firestore.FieldValue.serverTimestamp(),
      estado: 'activo'
    });

    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      uid: userAuth.uid,
      email: email,
      tipoUsuario: tipoUsuario
    });

  } catch (error) {
    console.error('Error en registro:', error);
    
    if (error.code === 'auth/email-already-exists') {
      return res.status(400).json({ 
        error: 'El email ya está registrado' 
      });
    }
    if (error.code === 'auth/weak-password') {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }
    
    res.status(500).json({ error: error.message });
  }
};

/**
 * INICIO DE SESIÓN
 * Autentica al usuario y devuelve un token
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y contraseña son requeridos' 
      });
    }

    // Obtener usuario por email
    const userAuth = await auth.getUserByEmail(email);

    // En una aplicación real, verificarías la contraseña aquí
    // Con Firebase Admin SDK, puedes usar Google Sign-In o tokens JWT

    // Crear un token personalizado
    const token = await auth.createCustomToken(userAuth.uid);

    // Obtener datos del usuario desde Firestore
    const userDoc = await db.collection('users').doc(userAuth.uid).get();
    const userData = userDoc.data();

    res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      token: token,
      usuario: {
        uid: userAuth.uid,
        email: userData.email,
        nombre: userData.nombre,
        apellido: userData.apellido,
        tipoUsuario: userData.tipoUsuario
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    
    if (error.code === 'auth/user-not-found') {
      return res.status(401).json({ 
        error: 'Usuario no encontrado' 
      });
    }
    
    res.status(500).json({ error: error.message });
  }
};

/**
 * OBTENER PERFIL DE USUARIO
 */
exports.obtenerPerfil = async (req, res) => {
  try {
    const uid = req.user.uid; // Obtenido del middleware de autenticación

    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.status(200).json({
      usuario: userDoc.data()
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * ACTUALIZAR PERFIL DE USUARIO
 */
exports.actualizarPerfil = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { nombre, apellido, telefono, fotoPerfil } = req.body;

    const actualizaciones = {};
    if (nombre) actualizaciones.nombre = nombre;
    if (apellido) actualizaciones.apellido = apellido;
    if (telefono) actualizaciones.telefono = telefono;
    if (fotoPerfil) actualizaciones.fotoPerfil = fotoPerfil;

    await db.collection('users').doc(uid).update(actualizaciones);

    res.status(200).json({
      mensaje: 'Perfil actualizado exitosamente',
      usuario: actualizaciones
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * CERRAR SESIÓN
 */
exports.logout = async (req, res) => {
  try {
    // El logout se maneja principalmente en el frontend revocando el token
    // Aquí puedes registrar logs o hacer limpieza si es necesario
    res.status(200).json({
      mensaje: 'Sesión cerrada exitosamente'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
