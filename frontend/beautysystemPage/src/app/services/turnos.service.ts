import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG, getFullUrl } from './api.config';
import { AuthService } from './auth.service';

export interface Turno {
  id: string;
  clienteId: string;
  profesionalId: string;
  servicioId: string;
  fecha: string;
  hora: string;
  estado: 'pendiente' | 'confirmado' | 'cancelado' | 'completado';
  notas?: string;
  motivoCancelacion?: string;
  fechaCreacion: string;
}

export interface AgendarTurnoData {
  profesionalId: string;
  servicioId: string;
  fecha: string;
  hora: string;
  notas?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TurnosService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Agendar turno (cliente)
  agendarTurno(turnoData: AgendarTurnoData): Observable<any> {
    const url = getFullUrl(API_CONFIG.endpoints.turnos.base);
    return this.http.post(url, turnoData, { headers: this.getAuthHeaders() });
  }

  // Obtener detalles de un turno
  obtenerTurno(turnoId: string): Observable<any> {
    const url = getFullUrl(`${API_CONFIG.endpoints.turnos.base}/${turnoId}`);
    return this.http.get(url, { headers: this.getAuthHeaders() });
  }

  // Obtener turnos del profesional
  obtenerTurnosProfesional(estado?: string): Observable<any> {
    const url = getFullUrl(API_CONFIG.endpoints.turnos.profesional);
    let params = new HttpParams();
    if (estado) {
      params = params.set('estado', estado);
    }
    return this.http.get(url, { headers: this.getAuthHeaders(), params });
  }

  // Obtener turnos del cliente
  obtenerTurnosCliente(estado?: string): Observable<any> {
    const url = getFullUrl(API_CONFIG.endpoints.turnos.cliente);
    let params = new HttpParams();
    if (estado) {
      params = params.set('estado', estado);
    }
    return this.http.get(url, { headers: this.getAuthHeaders(), params });
  }

  // Confirmar turno (profesional)
  confirmarTurno(turnoId: string): Observable<any> {
    const url = getFullUrl(`${API_CONFIG.endpoints.turnos.base}/${turnoId}/confirmar`);
    return this.http.put(url, {}, { headers: this.getAuthHeaders() });
  }

  // Cancelar turno
  cancelarTurno(turnoId: string, motivo: string): Observable<any> {
    const url = getFullUrl(`${API_CONFIG.endpoints.turnos.base}/${turnoId}/cancelar`);
    return this.http.put(url, { motivo }, { headers: this.getAuthHeaders() });
  }

  // Marcar turno como completado (profesional)
  completarTurno(turnoId: string): Observable<any> {
    const url = getFullUrl(`${API_CONFIG.endpoints.turnos.base}/${turnoId}/completar`);
    return this.http.put(url, {}, { headers: this.getAuthHeaders() });
  }

  // Reagendar turno
  reagendarTurno(turnoId: string, nuevaFecha: string, nuevaHora: string): Observable<any> {
    const url = getFullUrl(`${API_CONFIG.endpoints.turnos.base}/${turnoId}/reagendar`);
    return this.http.put(url, { fecha: nuevaFecha, hora: nuevaHora }, { headers: this.getAuthHeaders() });
  }
}
