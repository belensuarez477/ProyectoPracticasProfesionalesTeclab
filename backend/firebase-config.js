// firebase-config.js
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

let db = null;
let auth = null;
let isFirebaseInitialized = false;

// Intentar cargar credenciales reales
try {
  const serviceAccountPath = path.join(__dirname, './serviceAccountKey.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require('./serviceAccountKey.json');
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL || "https://tu-proyecto-id.firebaseio.com"
    });
    
    db = admin.firestore();
    auth = admin.auth();
    isFirebaseInitialized = true;
    
    console.log('✅ Firebase inicializado correctamente');
  } else {
    console.log('⚠️  serviceAccountKey.json no encontrado. Firebase en modo demo.');
    console.log('📝 Para habilitar: descarga serviceAccountKey.json desde Firebase Console');
    console.log('📍 Colócalo en: ' + serviceAccountPath);
  }
} catch (error) {
  console.log('⚠️  No se pudo inicializar Firebase:', error.message);
  console.log('📝 Asegúrate de que serviceAccountKey.json sea válido');
}

module.exports = { db, auth, admin, isFirebaseInitialized };
