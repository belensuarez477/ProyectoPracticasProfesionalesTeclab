// models/database-schema.js
/**
 * ESTRUCTURA DE BASE DE DATOS FIRESTORE
 * 
 * Colección: users
 * - uid (string): ID único del usuario (generado por Firebase Auth)
 * - email (string): Email del usuario
 * - nombre (string): Nombre completo
 * - apellido (string): Apellido
 * - telefono (string): Teléfono de contacto
 * - tipoUsuario (string): "profesional" o "cliente"
 * - fotoPerfil (string): URL de la foto de perfil
 * - fechaRegistro (timestamp): Fecha de registro
 * - estado (string): "activo" o "inactivo"
 * 
 * Subcolección dentro de users: servicios
 * - servicioId (string): ID del servicio
 * - nombre (string): Nombre del servicio (ej: "Limpieza Facial")
 * - descripcion (string): Descripción del servicio
 * - precio (number): Precio del servicio
 * - duracion (number): Duración en minutos
 * - createdAt (timestamp): Fecha de creación
 * 
 * Subcolección dentro de users/servicios: horarios
 * - dia (string): Día de la semana (lunes, martes, miércoles, etc)
 * - horaInicio (string): Hora de inicio (ej: "09:00")
 * - horaFin (string): Hora de fin (ej: "17:00")
 * - disponible (boolean): Si está disponible
 * 
 * Colección: turnos
 * - turnoId (string): ID único del turno
 * - profesionalId (string): UID del profesional
 * - clienteId (string): UID del cliente
 * - servicioId (string): ID del servicio
 * - fecha (date): Fecha del turno
 * - hora (string): Hora del turno (ej: "10:00")
 * - duracion (number): Duración en minutos
 * - estado (string): "confirmado", "pendiente", "cancelado"
 * - precioFinal (number): Precio final cobrado
 * - notas (string): Notas adicionales
 * - createdAt (timestamp): Fecha de creación del turno
 */

// Ejemplo de estructura de documento de Usuario Profesional
const usuarioProfesionalEjemplo = {
  uid: "user123", // Generado por Firebase
  email: "profesional@example.com",
  nombre: "María",
  apellido: "García",
  telefono: "+34612345678",
  tipoUsuario: "profesional",
  fotoPerfil: "https://...",
  fechaRegistro: new Date(),
  estado: "activo",
  // Subcolección "servicios":
  // {
  //   servicioId: "serv001",
  //   nombre: "Limpieza Facial",
  //   descripcion: "Limpieza profunda del rostro",
  //   precio: 35.00,
  //   duracion: 60,
  //   createdAt: new Date()
  //   // Subcolección "horarios":
  //   // {
  //   //   dia: "lunes",
  //   //   horaInicio: "09:00",
  //   //   horaFin: "17:00",
  //   //   disponible: true
  //   // }
  // }
};

// Ejemplo de estructura de documento de Turno
const turnoEjemplo = {
  turnoId: "turno001",
  profesionalId: "user123",
  clienteId: "user456",
  servicioId: "serv001",
  fecha: new Date("2026-02-10"),
  hora: "10:00",
  duracion: 60,
  estado: "confirmado",
  precioFinal: 35.00,
  notas: "Cliente solicita exfoliación adicional",
  createdAt: new Date()
};

module.exports = {
  usuarioProfesionalEjemplo,
  turnoEjemplo
};
