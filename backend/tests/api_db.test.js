const assert = require('assert');

const base = process.env.BASE_URL || 'http://localhost:5000';
const fetchImpl = global.fetch || require('node-fetch');

async function request(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetchImpl(`${base}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await res.text();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (_) {
    parsed = text;
  }

  return { status: res.status, body: parsed };
}

function assertOk(condition, message) {
  assert.ok(condition, message);
}

(async () => {
  console.log(`
🧪 Ejecutando prueba automatizada contra ${base}
`);

  // 1) Verificar que la API responde
  const root = await request('GET', '/');
  assertOk(root.status === 200, `Respuesta inesperada en /: ${root.status}`);
  assertOk(root.body && root.body.mensaje, 'La respuesta de / no contiene mensaje');

  const firebaseStatus = root.body.firebaseStatus || '';
  const firebaseOk = typeof firebaseStatus === 'string' && firebaseStatus.includes('Inicializado');

  if (!firebaseOk) {
    throw new Error(
      'Firebase no está inicializado. Configura serviceAccountKey.json para validar la base de datos.'
    );
  }

  // 2) Registrar profesional (crea usuario en Firebase + Firestore)
  const timestamp = Date.now();
  const email = `prof.${timestamp}@beauty.test`;
  const password = 'SecurePass123!';

  const registro = await request('POST', '/auth/registro', {
    email,
    password,
    nombre: 'Sofia',
    apellido: 'Martinez',
    tipoUsuario: 'profesional'
  });

  assertOk(registro.status === 201, `Registro falló: ${registro.status}`);
  assertOk(registro.body && registro.body.exito === true, 'Registro no exitoso');
  assertOk(registro.body.token, 'Registro no devolvió token');
  assertOk(registro.body.usuario && registro.body.usuario.email === email, 'Email no coincide');

  // 3) Login
  const login = await request('POST', '/auth/login', { email, password });
  assertOk(login.status === 200, `Login falló: ${login.status}`);
  assertOk(login.body && login.body.exito === true, 'Login no exitoso');
  assertOk(login.body.token, 'Login no devolvió token');

  const token = login.body.token;

  // 4) Perfil (lee datos desde Firestore)
  const perfil = await request('GET', '/auth/perfil', null, token);
  assertOk(perfil.status === 200, `Perfil falló: ${perfil.status}`);
  assertOk(perfil.body && perfil.body.usuario, 'Perfil no devolvió usuario');
  assertOk(perfil.body.usuario.email === email, 'Email del perfil no coincide');

  // 5) Crear servicio (escritura en Firestore)
  const servicio = await request('POST', '/servicios', {
    nombre: 'Limpieza Facial Premium',
    descripcion: 'Limpieza profunda con productos naturales',
    precio: 35,
    duracion: 60
  }, token);

  assertOk(servicio.status === 201, `Crear servicio falló: ${servicio.status}`);
  assertOk(servicio.body && servicio.body.exito === true, 'Servicio no fue creado');

  // 6) Obtener servicios
  const servicios = await request('GET', '/servicios', null, token);
  assertOk(servicios.status === 200, `Obtener servicios falló: ${servicios.status}`);
  assertOk(Array.isArray(servicios.body.servicios), 'Servicios no es un array');

  console.log('✅ Prueba automatizada OK: API y base de datos funcionando.');
  process.exit(0);
})().catch((err) => {
  console.error('❌ Prueba automatizada falló:', err.message);
  process.exit(1);
});
