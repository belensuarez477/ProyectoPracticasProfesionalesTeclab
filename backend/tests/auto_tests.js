const base = process.env.BASE_URL || 'http://localhost:5000';
const apiKey = process.env.FIREBASE_API_KEY || '';

// Test data - Nuevos datos de prueba (email único por timestamp)
const timestamp = Math.random().toString(36).substring(2, 9);
const profEmail = `profesional.${timestamp}@beauty.test`;
const profPass = 'SecurePass123!';
const profNombre = 'Sofia';
const profApellido = 'Martinez';

const servicioNombre = 'Depilación con Láser Profesional';
const servicioDesc = 'Depilación láser avanzada para todo el cuerpo';
const servicioDuracion = 45;
const servicioPrecio = 75;

let fetch = global.fetch;
if (!fetch) {
  try {
    fetch = require('node-fetch');
  } catch (e) {
    console.error('fetch no disponible. Instala node-fetch o usa Node.js >=18');
    process.exit(1);
  }
}

async function post(path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(base + path, { method: 'POST', headers, body: JSON.stringify(body) });
  const text = await res.text();
  let parsed;
  try { parsed = JSON.parse(text); } catch (e) { parsed = text; }
  return { status: res.status, body: parsed };
}

async function exchangeToken(customToken) {
  if (!apiKey) return customToken;
  try {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true })
    });
    const data = await resp.json();
    return data.idToken || customToken;
  } catch (e) {
    console.warn('Token exchange failed:', e.message);
    return customToken;
  }
}

(async () => {
  console.log('Running automated tests against', base, '\n');

  // 1) Registrar profesional
  const registro = await post('/auth/registro', {
    email: profEmail,
    password: profPass,
    nombre: profNombre,
    apellido: profApellido,
    tipoUsuario: 'profesional'
  });
  console.log('--- Registro profesional ---');
  console.log('Status:', registro.status);
  console.log('Body:', JSON.stringify(registro.body, null, 2), '\n');

  // 2) Login profesional
  const login = await post('/auth/login', {
    email: profEmail,
    password: profPass
  });
  console.log('--- Login profesional ---');
  console.log('Status:', login.status);
  console.log('Body:', JSON.stringify(login.body, null, 2), '\n');

  const returnedToken = (login.body && (login.body.token || login.body.idToken || login.body.accessToken)) || '';
  console.log('--- Token extracted ---');
  console.log(returnedToken ? returnedToken.substring(0, 50) + '...' : '(no token)', '\n');

  if (!returnedToken) {
    console.log('No token found; stopping.');
    process.exit(0);
  }

  const idToken = await exchangeToken(returnedToken);

  // 3) Crear servicio
  const servicio = await post('/servicios', {
    nombre: servicioNombre,
    descripcion: servicioDesc,
    duracion: servicioDuracion,
    precio: servicioPrecio
  }, idToken);

  console.log('--- Crear servicio ---');
  console.log('Status:', servicio.status);
  console.log('Body:', JSON.stringify(servicio.body, null, 2), '\n');

  process.exit(0);
})();
