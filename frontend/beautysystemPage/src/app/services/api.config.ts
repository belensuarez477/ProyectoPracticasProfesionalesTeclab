// Configuración de la API
export const API_CONFIG = {
  baseUrl: 'http://localhost:5000',
  endpoints: {
    auth: {
      login: '/auth/login',
      registro: '/auth/registro',
      perfil: '/auth/perfil',
      logout: '/auth/logout'
    },
    servicios: {
      base: '/servicios',
      horarios: '/servicios/horarios'
    },
    turnos: {
      base: '/turnos',
      profesional: '/turnos/profesional/mis-turnos',
      cliente: '/turnos/cliente/mis-turnos'
    }
  }
};

export function getFullUrl(endpoint: string): string {
  return `${API_CONFIG.baseUrl}${endpoint}`;
}
