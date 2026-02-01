import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { API_CONFIG, getFullUrl } from './api.config';

export interface User {
  id: string;
  nombre: string;
  apellido?: string;
  email: string;
  telefono?: string;
  tipoUsuario: 'cliente' | 'profesional';
}

export interface AuthResponse {
  exito: boolean;
  mensaje: string;
  token?: string;
  usuario?: User;
}

export interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono: string;
  tipoUsuario: 'cliente' | 'profesional';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(this.loadUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  private tokenKey = 'beautysystem_token';
  private currentUserKey = 'beautysystem_current_user';
  private isBrowser: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  private loadUserFromStorage(): User | null {
    if (typeof window === 'undefined' || !localStorage) return null;
    const userJson = localStorage.getItem(this.currentUserKey);
    return userJson ? JSON.parse(userJson) : null;
  }

  register(registerData: RegisterData): Observable<AuthResponse> {
    const url = getFullUrl(API_CONFIG.endpoints.auth.registro);
    console.log('Enviando registro a:', url);
    console.log('Datos:', registerData);
    return this.http.post<AuthResponse>(url, registerData).pipe(
      tap(response => {
        console.log('Respuesta del servidor:', response);
        if (response.exito && response.token && response.usuario) {
          this.saveSession(response.token, response.usuario);
        }
      }),
      catchError(error => {
        console.error('Error completo en registro:', error);
        console.error('Error status:', error.status);
        console.error('Error body:', error.error);
        const mensaje = error.error?.mensaje || error.error?.error || error.message || 'Error al registrar usuario';
        return of({ exito: false, mensaje: mensaje });
      })
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const url = getFullUrl(API_CONFIG.endpoints.auth.login);
    return this.http.post<AuthResponse>(url, { email, password }).pipe(
      tap(response => {
        if (response.exito && response.token && response.usuario) {
          this.saveSession(response.token, response.usuario);
        }
      }),
      catchError(error => {
        console.error('Error en login:', error);
        return of({ exito: false, mensaje: error.error?.mensaje || 'Error al iniciar sesión' });
      })
    );
  }

  logout(): Observable<any> {
    const url = getFullUrl(API_CONFIG.endpoints.auth.logout);
    return this.http.post(url, {}).pipe(
      tap(() => {
        this.clearSession();
      }),
      catchError(() => {
        this.clearSession();
        return of({ exito: true });
      })
    );
  }

  obtenerPerfil(): Observable<any> {
    const url = getFullUrl(API_CONFIG.endpoints.auth.perfil);
    return this.http.get(url, { headers: this.getAuthHeaders() });
  }

  actualizarPerfil(datos: Partial<User>): Observable<any> {
    const url = getFullUrl(API_CONFIG.endpoints.auth.perfil);
    return this.http.put(url, datos, { headers: this.getAuthHeaders() });
  }

  private saveSession(token: string, usuario: User): void {
    if (typeof window === 'undefined' || !localStorage) return;
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.currentUserKey, JSON.stringify(usuario));
    this.currentUserSubject.next(usuario);
  }

  private clearSession(): void {
    if (typeof window === 'undefined' || !localStorage) return;
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.currentUserKey);
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return this.currentUserSubject.value !== null && this.getToken() !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    if (typeof window === 'undefined' || !localStorage) return null;
    return localStorage.getItem(this.tokenKey);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }
}
