// tests/ejemplos-pruebas.js
/**
 * ARCHIVO DE PRUEBAS PARA LA API
 * 
 * Puedes usar Postman o cualquier cliente HTTP para probar estos endpoints.
 * O ejecutar este archivo con: node tests/ejemplos-pruebas.js
 */

const BASE_URL = 'http://localhost:5000';

// Variable para guardar el token
let tokenProfesional = '';
let tokenCliente = '';
let profesionalId = '';
let servicioId = '';
let turnoId = '';

/**
 * 1. REGISTRO DEL PROFESIONAL
 */
async function registroProfesional() {
  console.log('\n=== 1. REGISTRO DEL PROFESIONAL ===');
  
  const response = await fetch(`${BASE_URL}/auth/registro`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'maria.garcia@example.com',
      password: 'password123',
      nombre: 'María',
      apellido: 'García',
      telefono: '+34612345678',
      tipoUsuario: 'profesional'
    })
  });

  const data = await response.json();
  console.log('Respuesta:', data);
  profesionalId = data.uid;
  return data;
}

/**
 * 2. LOGIN DEL PROFESIONAL
 */
async function loginProfesional() {
  console.log('\n=== 2. LOGIN DEL PROFESIONAL ===');
  
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'maria.garcia@example.com',
      password: 'password123'
    })
  });

  const data = await response.json();
  console.log('Respuesta:', data);
  tokenProfesional = data.token;
  return data;
}

/**
 * 3. CREAR SERVICIO
 */
async function crearServicio() {
  console.log('\n=== 3. CREAR SERVICIO ===');
  
  const response = await fetch(`${BASE_URL}/servicios`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenProfesional}`
    },
    body: JSON.stringify({
      nombre: 'Limpieza Facial',
      descripcion: 'Limpieza profunda del rostro con productos naturales',
      precio: 35.00,
      duracion: 60
    })
  });

  const data = await response.json();
  console.log('Respuesta:', data);
  servicioId = data.servicioId;
  return data;
}

/**
 * 4. ESTABLECER HORARIOS
 */
async function establecerHorarios() {
  console.log('\n=== 4. ESTABLECER HORARIOS ===');
  
  const response = await fetch(`${BASE_URL}/servicios/horarios`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenProfesional}`
    },
    body: JSON.stringify({
      servicioId: servicioId,
      horarios: [
        {
          dia: 'lunes',
          horaInicio: '09:00',
          horaFin: '17:00',
          disponible: true
        },
        {
          dia: 'martes',
          horaInicio: '09:00',
          horaFin: '17:00',
          disponible: true
        },
        {
          dia: 'miércoles',
          horaInicio: '10:00',
          horaFin: '14:00',
          disponible: true
        }
      ]
    })
  });

  const data = await response.json();
  console.log('Respuesta:', data);
  return data;
}

/**
 * 5. OBTENER SERVICIOS DEL PROFESIONAL
 */
async function obtenerServicios() {
  console.log('\n=== 5. OBTENER SERVICIOS DEL PROFESIONAL ===');
  
  const response = await fetch(`${BASE_URL}/servicios`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${tokenProfesional}`
    }
  });

  const data = await response.json();
  console.log('Respuesta:', data);
  return data;
}

/**
 * 6. REGISTRO DEL CLIENTE
 */
async function registroCliente() {
  console.log('\n=== 6. REGISTRO DEL CLIENTE ===');
  
  const response = await fetch(`${BASE_URL}/auth/registro`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'juan.perez@example.com',
      password: 'password123',
      nombre: 'Juan',
      apellido: 'Pérez',
      telefono: '+34612345679',
      tipoUsuario: 'cliente'
    })
  });

  const data = await response.json();
  console.log('Respuesta:', data);
  return data;
}

/**
 * 7. LOGIN DEL CLIENTE
 */
async function loginCliente() {
  console.log('\n=== 7. LOGIN DEL CLIENTE ===');
  
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: 'juan.perez@example.com',
      password: 'password123'
    })
  });

  const data = await response.json();
  console.log('Respuesta:', data);
  tokenCliente = data.token;
  return data;
}

/**
 * 8. AGENDAR TURNO
 */
async function agendarTurno() {
  console.log('\n=== 8. AGENDAR TURNO ===');
  
  const response = await fetch(`${BASE_URL}/turnos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenCliente}`
    },
    body: JSON.stringify({
      profesionalId: profesionalId,
      servicioId: servicioId,
      fecha: '2026-02-10',
      hora: '10:00',
      notas: 'Preferencia: sin productos químicos'
    })
  });

  const data = await response.json();
  console.log('Respuesta:', data);
  turnoId = data.turnoId;
  return data;
}

/**
 * 9. CONFIRMAR TURNO
 */
async function confirmarTurno() {
  console.log('\n=== 9. CONFIRMAR TURNO ===');
  
  const response = await fetch(`${BASE_URL}/turnos/${turnoId}/confirmar`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokenProfesional}`
    },
    body: JSON.stringify({
      precioFinal: 35.00
    })
  });

  const data = await response.json();
  console.log('Respuesta:', data);
  return data;
}

/**
 * 10. OBTENER TURNOS DEL PROFESIONAL
 */
async function obtenerTurnosProfesional() {
  console.log('\n=== 10. OBTENER TURNOS DEL PROFESIONAL ===');
  
  const response = await fetch(`${BASE_URL}/turnos/profesional/mis-turnos?estado=confirmado`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${tokenProfesional}`
    }
  });

  const data = await response.json();
  console.log('Respuesta:', data);
  return data;
}

/**
 * 11. OBTENER TURNOS DEL CLIENTE
 */
async function obtenerTurnosCliente() {
  console.log('\n=== 11. OBTENER TURNOS DEL CLIENTE ===');
  
  const response = await fetch(`${BASE_URL}/turnos/cliente/mis-turnos`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${tokenCliente}`
    }
  });

  const data = await response.json();
  console.log('Respuesta:', data);
  return data;
}

/**
 * EJECUTAR TODAS LAS PRUEBAS EN ORDEN
 */
async function ejecutarPruebas() {
  try {
    console.log('========================================');
    console.log('INICIANDO PRUEBAS DE LA API');
    console.log('========================================');

    await registroProfesional();
    await loginProfesional();
    await crearServicio();
    await establecerHorarios();
    await obtenerServicios();

    await registroCliente();
    await loginCliente();
    await agendarTurno();
    await confirmarTurno();
    await obtenerTurnosProfesional();
    await obtenerTurnosCliente();

    console.log('\n========================================');
    console.log('✓ TODAS LAS PRUEBAS COMPLETADAS');
    console.log('========================================');

  } catch (error) {
    console.error('Error durante las pruebas:', error);
  }
}

// Descomentar para ejecutar si se usa como módulo
// ejecutarPruebas();

module.exports = {
  ejecutarPruebas,
  registroProfesional,
  loginProfesional,
  crearServicio,
  establecerHorarios,
  obtenerServicios,
  registroCliente,
  loginCliente,
  agendarTurno,
  confirmarTurno,
  obtenerTurnosProfesional,
  obtenerTurnosCliente
};
