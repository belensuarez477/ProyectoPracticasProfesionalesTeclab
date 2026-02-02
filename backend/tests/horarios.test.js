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
  console.log(`\n🧪 Prueba de horarios contra ${base}\n`);

  // 1) Registro profesional
  const timestamp = Date.now();
  const email = `prof.horarios.${timestamp}@beauty.test`;
  const password = 'SecurePass123!';

  const registro = await request('POST', '/auth/registro', {
    email,
    password,
    nombre: 'Luz',
    apellido: 'Gomez',
    tipoUsuario: 'profesional'
  });

  assertOk(registro.status === 201, `Registro falló: ${registro.status}`);
  assertOk(registro.body?.token, 'Registro no devolvió token');

  // 2) Login
  const login = await request('POST', '/auth/login', { email, password });
  assertOk(login.status === 200, `Login falló: ${login.status}`);
  assertOk(login.body?.token, 'Login no devolvió token');

  const token = login.body.token;

  // 3) Crear servicio
  const servicio = await request('POST', '/servicios', {
    nombre: 'Corte de Cabello',
    descripcion: 'Corte y peinado básico',
    precio: 25,
    duracion: 30
  }, token);

  assertOk(servicio.status === 201, `Crear servicio falló: ${servicio.status}`);
  assertOk(servicio.body?.servicioId, 'No se devolvió servicioId');

  const servicioId = servicio.body.servicioId;

  // 4) Establecer horario
  const setHorario = await request('POST', '/servicios/horarios', {
    servicioId,
    horarios: [{
      dia: 'lunes',
      horaInicio: '09:00',
      horaFin: '12:00',
      disponible: true
    }]
  }, token);

  assertOk(setHorario.status === 200, `Establecer horario falló: ${setHorario.status}`);
  assertOk(setHorario.body?.exito === true, 'Respuesta de horarios no exitosa');

  // 5) Obtener servicios y verificar horarios
  const servicios = await request('GET', '/servicios', null, token);
  assertOk(servicios.status === 200, `Obtener servicios falló: ${servicios.status}`);
  assertOk(Array.isArray(servicios.body?.servicios), 'Servicios no es un array');

  const creado = servicios.body.servicios.find((s) => (s.servicioId || s.id) === servicioId);
  assertOk(creado, 'Servicio creado no encontrado');
  assertOk(Array.isArray(creado.horarios), 'Horarios no es un array');
  assertOk(creado.horarios.length > 0, 'Horarios no se recuperaron');

  console.log('✅ Prueba de horarios OK: creación y lectura funcionan.');
  process.exit(0);
})().catch((err) => {
  console.error('❌ Prueba de horarios falló:', err.message);
  process.exit(1);
});
