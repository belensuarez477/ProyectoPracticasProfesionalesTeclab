import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG, getFullUrl } from './api.config';
import { AuthService } from './auth.service';

export interface Servicio {
  id: string;
  servicioId: string;
  profesionalId?: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion: number;
  activo?: boolean;
  fechaCreacion?: string;
}

export interface Horario {
  dia: string;
  horaInicio: string;
  horaFin: string;
  disponible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ServiciosService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    console.log('Token obtenido para servicios:', token ? token.substring(0, 30) + '...' : 'NO HAY TOKEN');
    if (!token) {
      console.error('ERROR: No hay token disponible!');
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Crear servicio (solo profesionales)
  crearServicio(servicio: { nombre: string; descripcion: string; precio: number; duracion: number }): Observable<any> {
    const url = getFullUrl(API_CONFIG.endpoints.servicios.base);
    console.log('Creando servicio en:', url);
    console.log('Headers:', this.getAuthHeaders());
    return this.http.post(url, servicio, { headers: this.getAuthHeaders() });
  }

  // Obtener servicios del profesional autenticado
  obtenerServicios(): Observable<any> {
    const url = getFullUrl(API_CONFIG.endpoints.servicios.base);
    return this.http.get(url, { headers: this.getAuthHeaders() });
  }

  // Obtener todos los servicios disponibles (para clientes)
  obtenerServiciosDisponibles(): Observable<any> {
    const url = getFullUrl('/servicios/disponibles');
    return this.http.get(url);
  }

  // Actualizar servicio
  actualizarServicio(servicioId: string, datos: Partial<Servicio>): Observable<any> {
    const url = getFullUrl(`${API_CONFIG.endpoints.servicios.base}/${servicioId}`);
    return this.http.put(url, datos, { headers: this.getAuthHeaders() });
  }

  // Eliminar servicio
  eliminarServicio(servicioId: string): Observable<any> {
    const url = getFullUrl(`${API_CONFIG.endpoints.servicios.base}/${servicioId}`);
    return this.http.delete(url, { headers: this.getAuthHeaders() });
  }

  // Establecer horarios
  establecerHorarios(data: { servicioId: string; horarios: Horario[] }): Observable<any> {
    const url = getFullUrl(API_CONFIG.endpoints.servicios.horarios);
    return this.http.post(url, data, { headers: this.getAuthHeaders() });
  }

  // Obtener horarios disponibles
  obtenerHorariosDisponibles(servicioId: string, fecha: string): Observable<any> {
    const url = getFullUrl(`/servicios/${servicioId}/horarios-disponibles`);
    const params = new HttpParams().set('fecha', fecha);
    return this.http.get(url, { params });
  }
}
