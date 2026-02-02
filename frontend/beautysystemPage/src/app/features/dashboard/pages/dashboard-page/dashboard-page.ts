import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../../services/auth.service';
import { ServiciosService, Servicio } from '../../../../services/servicios.service';
import { TurnosService } from '../../../../services/turnos.service';
import { finalize, timeout } from 'rxjs/operators';

interface Appointment {
  id: string;
  date: string;
  time: string;
  clientName: string;
  service: string;
}

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.css',
})
export class DashboardPage implements OnInit {
  currentUser: User | null = null;
  appointments: Appointment[] = [];
  services: Servicio[] = [];
  activeTab = 'profile';
  isLoading = false;
  isLoadingServices = false;
  isSavingService = false;
  servicesError: string | null = null;
  private servicesLoadTimeoutId: any = null;
  selectedService: any = null;
  serviceAppointments: any[] = [];
  selectedDay: string = 'lunes';
  daysOfWeek = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

  newAppointment = {
    date: '',
    time: '',
    clientName: '',
    serviceId: ''
  };

  newService = {
    nombre: '',
    descripcion: '',
    duracion: 30,
    precio: 0
  };

  newSchedule = {
    dia: 'lunes',
    horaInicio: '09:00',
    horaFin: '18:00',
    disponible: true
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService: AuthService,
    private router: Router,
    private serviciosService: ServiciosService,
    private turnosService: TurnosService
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const currentUrl = this.router.url;
    if (currentUrl.includes('/dashboard/servicios')) {
      this.activeTab = 'services';
    } else if (currentUrl.includes('/dashboard/turnos')) {
      this.activeTab = 'appointments';
    } else if (currentUrl.includes('/dashboard/perfil')) {
      this.activeTab = 'profile';
    }
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser && !(this.currentUser as any).id) {
      const resolvedId = this.getResolvedUserId();
      if (resolvedId) {
        this.currentUser = { ...this.currentUser, id: resolvedId } as any;
      }
    }
    console.log('Usuario actual en dashboard:', this.currentUser);
    console.log('Token en localStorage:', this.authService.getToken() ? 'SÍ HAY TOKEN' : 'NO HAY TOKEN');

    this.isLoadingServices = false;
    this.isSavingService = false;

    if (!this.currentUser) {
      console.warn('No hay usuario, redirigiendo a home');
      this.router.navigate(['/']);
      return;
    }

    this.loadAppointments();
    this.loadServices();
  }

  setTab(tab: string): void {
    this.activeTab = tab;
    if (tab === 'services') {
      this.router.navigate(['/dashboard/servicios']);
    } else if (tab === 'appointments') {
      this.router.navigate(['/dashboard/turnos']);
    } else if (tab === 'profile') {
      this.router.navigate(['/dashboard/perfil']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  loadAppointments(): void {
    if (this.currentUser?.tipoUsuario === 'profesional') {
      this.turnosService.obtenerTurnosProfesional().subscribe({
        next: (response: any) => {
          const turnos = Array.isArray(response?.turnos) ? response.turnos : [];
          this.appointments = turnos.map((t: any) => {
            const fechaDate = this.normalizeDate(t.fecha);
            return {
              id: t.turnoId || t.id,
              date: isNaN(fechaDate.getTime()) ? '' : fechaDate.toLocaleDateString('es-AR'),
              time: t.hora,
              clientName: t.clienteNombre || 'Cliente',
              service: t.servicioNombre || 'Servicio'
            };
          });
          console.log('Turnos profesional cargados:', this.appointments.length);
        },
        error: (err: any) => console.error('Error al cargar turnos:', err)
      });
    } else {
      this.turnosService.obtenerTurnosCliente().subscribe({
        next: (response: any) => {
          const turnos = Array.isArray(response?.turnos) ? response.turnos : [];
          this.appointments = turnos.map((t: any) => {
            const fechaDate = this.normalizeDate(t.fecha);
            return {
              id: t.turnoId || t.id,
              date: isNaN(fechaDate.getTime()) ? '' : fechaDate.toLocaleDateString('es-AR'),
              time: t.hora,
              clientName: 'Yo',
              service: t.servicioNombre || 'Servicio'
            };
          });
          console.log('Turnos cliente cargados:', this.appointments.length);
        },
        error: (err: any) => console.error('Error al cargar turnos:', err)
      });
    }
  }

  loadServices(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    this.isLoadingServices = true;
    this.servicesError = null;
    if (this.servicesLoadTimeoutId) {
      clearTimeout(this.servicesLoadTimeoutId);
    }
    this.servicesLoadTimeoutId = setTimeout(() => {
      if (this.isLoadingServices) {
        this.isLoadingServices = false;
        console.warn('Carga de servicios finalizada por timeout de UI.');
      }
    }, 12000);
    console.log('Iniciando carga de servicios...');
    this.serviciosService.obtenerServicios().pipe(
      timeout(10000),
      finalize(() => {
        this.isLoadingServices = false;
      })
    ).subscribe({
      next: (response: any) => {
        console.log('Servicios obtenidos:', response);
        this.isLoadingServices = false;
        const servicios = response?.servicios;
        if (Array.isArray(servicios)) {
          const fetchedServices = servicios.map((service: any) => ({
            ...service,
            id: service.id || service.servicioId,
            servicioId: service.servicioId || service.id
          }));
          const fetchedIds = new Set(
            fetchedServices
              .map((service: any) => service.servicioId || service.id)
              .filter((id: string | undefined) => Boolean(id))
          );
          const optimisticServices = this.services.filter(
            (service: any) => {
              const id = service.servicioId || service.id;
              return id && !fetchedIds.has(id);
            }
          );
          this.services = [...optimisticServices, ...fetchedServices];
          console.log('Servicios cargados exitosamente:', this.services.length);
          if (this.services.length === 0) {
            this.loadServicesPublicFallback();
          }
        } else {
          console.warn('Respuesta sin servicios o sin exito:', response);
          this.loadServicesPublicFallback();
        }
      },
      error: (err: any) => {
        console.error('Error al cargar servicios:', err);
        console.error('Status:', err.status);
        console.error('Error completo:', err.error);
        this.isLoadingServices = false;
        this.servicesError = err.error?.mensaje || err.error?.error || err.message || 'Error al cargar servicios';
        
        if (err.status === 0) {
          alert('No se puede conectar con el backend. Verifica que esté corriendo en http://localhost:5000');
        } else if (err.name === 'TimeoutError') {
          alert('La carga de servicios tardó demasiado. Intenta nuevamente.');
        } else if (err.status === 401) {
          alert('Sesión expirada. Por favor inicia sesión nuevamente.');
          this.authService.logout();
          this.router.navigate(['/']);
        }
        this.loadServicesPublicFallback();
      }
    });
  }

  private loadServicesPublicFallback(): void {
    const resolvedId = this.getResolvedUserId();
    if (!resolvedId || this.currentUser?.tipoUsuario !== 'profesional') {
      return;
    }

    this.serviciosService.obtenerServiciosProfesional(resolvedId).subscribe({
      next: (response: any) => {
        const servicios = response?.servicios;
        if (Array.isArray(servicios)) {
          const fetchedServices = servicios.map((service: any) => ({
            ...service,
            id: service.id || service.servicioId,
            servicioId: service.servicioId || service.id
          }));
          this.services = fetchedServices;
          console.log('Servicios cargados por fallback público:', this.services.length);
        }
      },
      error: (err: any) => {
        console.error('Error en fallback público de servicios:', err);
      }
    });
  }

  private getResolvedUserId(): string | null {
    const currentUserAny = this.currentUser as any;
    if (currentUserAny?.id) return currentUserAny.id;
    if (currentUserAny?.uid) return currentUserAny.uid;
    const token = this.authService.getToken();
    if (!token) return null;
    return this.decodeUserIdFromToken(token);
  }

  private decodeUserIdFromToken(token: string): string | null {
    try {
      const payload = token.split('.')[1];
      if (!payload) return null;
      const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const data = JSON.parse(jsonPayload);
      return data?.uid || null;
    } catch (error) {
      console.error('Error decodificando token:', error);
      return null;
    }
  }

  addAppointment(): void {
    if (!this.newAppointment.date || !this.newAppointment.time || !this.newAppointment.serviceId) {
      alert('Por favor completa fecha, hora y servicio');
      return;
    }

    const servicioSeleccionado = this.services.find(
      s => (s.servicioId || s.id) === this.newAppointment.serviceId
    );

    if (!this.currentUser?.id) {
      alert('No hay usuario autenticado');
      return;
    }

    this.turnosService.agendarTurno({
      profesionalId: this.currentUser.id,
      servicioId: this.newAppointment.serviceId,
      fecha: this.newAppointment.date,
      hora: this.newAppointment.time,
      clienteNombre: this.newAppointment.clientName || ''
    }).subscribe({
      next: (response: any) => {
        if (response.exito) {
          alert('¡Turno agendado exitosamente!');
          this.newAppointment = { date: '', time: '', clientName: '', serviceId: '' };
          this.loadAppointments();
          if (servicioSeleccionado) {
            const servicioId = servicioSeleccionado.servicioId || servicioSeleccionado.id;
            if (servicioId) {
              this.loadServiceAppointments(servicioId);
            }
          }
        } else {
          alert(response.mensaje || 'No se pudo agendar el turno');
        }
      },
      error: (err: any) => {
        console.error('Error al agendar turno:', err);
        alert(err.error?.error || 'Error al agendar turno');
      }
    });
  }

  deleteAppointment(id: string): void {
    this.appointments = this.appointments.filter(a => a.id !== id);
  }

  addService(): void {
    if (this.newService.nombre && this.newService.precio > 0) {
      this.isSavingService = true;
      const tempId = `temp-${Date.now()}`;
      const optimisticService: Servicio = {
        id: tempId,
        servicioId: tempId,
        nombre: this.newService.nombre,
        descripcion: this.newService.descripcion,
        duracion: this.newService.duracion,
        precio: this.newService.precio,
        optimistic: true
      };
      this.services = [optimisticService, ...this.services];

      this.serviciosService.crearServicio(this.newService).pipe(
        timeout(10000),
        finalize(() => {
          this.isSavingService = false;
        })
      ).subscribe({
        next: (response: any) => {
          console.log('Respuesta crear servicio:', response);
          this.isSavingService = false;
          if (response.exito) {
            const servicioId = response.servicioId || response.id || response.servicio?.id;
            if (servicioId) {
              this.services = this.services.map(service =>
                service.id === tempId
                  ? {
                      ...service,
                      id: servicioId,
                      servicioId: servicioId,
                      optimistic: false
                    }
                  : service
              );
            }
            this.newService = { nombre: '', descripcion: '', duracion: 30, precio: 0 };
            this.loadServices();
            alert('✓ ' + response.mensaje);
          } else {
            this.services = this.services.filter(service => service.id !== tempId);
            this.isSavingService = false;
            alert('Error: ' + response.mensaje);
          }
        },
        error: (err: any) => {
          console.error('Error completo al crear servicio:', err);
          console.error('Status:', err.status);
          console.error('Error body:', err.error);
          this.services = this.services.filter(service => service.id !== tempId);
          this.isSavingService = false;
          
          let mensaje = 'Error desconocido';
          if (err.status === 0) {
            mensaje = 'No se puede conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:5000';
          } else if (err.name === 'TimeoutError') {
            mensaje = 'La creación tardó demasiado. Revisa si se guardó en Firebase y recarga la lista.';
          } else if (err.status === 403) {
            mensaje = 'Solo los profesionales pueden crear servicios. Tu cuenta es de tipo cliente.';
          } else if (err.status === 401) {
            mensaje = 'No estás autenticado. Por favor inicia sesión nuevamente.';
          } else if (err.error?.mensaje) {
            mensaje = err.error.mensaje;
          } else if (err.message) {
            mensaje = err.message;
          }
          
          alert('Error al crear servicio: ' + mensaje);
        }
      });
    } else {
      alert('Por favor completa todos los campos (nombre y precio)');
    }
  }

  deleteService(id: string): void {
    if (confirm('¿Estás seguro de eliminar este servicio?')) {
      this.serviciosService.eliminarServicio(id).subscribe({
        next: (response: any) => {
          if (response.exito) {
            alert('Servicio eliminado');
            this.loadServices();
          }
        },
        error: (err: any) => {
          console.error('Error al eliminar:', err);
          alert('Error al eliminar servicio');
        }
      });
    }
  }

  viewServiceDetails(service: any): void {
    console.log('Abriendo detalles del servicio:', service);
    this.selectedService = service;
    const servicioId = service?.servicioId || service?.id;
    if (servicioId) {
      this.loadServiceAppointments(servicioId);
    } else {
      this.serviceAppointments = [];
    }
  }

  closeServiceDetails(): void {
    this.selectedService = null;
    this.serviceAppointments = [];
  }

  loadServiceAppointments(servicioId: string): void {
    console.log('Cargando turnos para servicioId:', servicioId);
    const selectedServiceName = (this.selectedService?.nombre || '').toString().trim().toLowerCase();
    // Obtener todos los turnos del profesional y filtrar por servicio
    this.turnosService.obtenerTurnosProfesional().subscribe({
      next: (response: any) => {
        console.log('Respuesta de turnos del profesional:', response);
        if (response.exito && response.turnos) {
          console.log('Turnos obtenidos, cantidad:', response.turnos.length);
          console.log('Filtrando por servicioId:', servicioId);
          
          this.serviceAppointments = response.turnos
            .filter((t: any) => {
              const turnoServicioId = t.servicioId || t.servicio_id || t.serviceId;
              const turnoServicioNombre = (t.servicioNombre || t.serviceName || '').toString().trim().toLowerCase();
              const matchById = turnoServicioId && turnoServicioId === servicioId;
              const matchByName = !turnoServicioId && selectedServiceName && turnoServicioNombre === selectedServiceName;
              console.log('Comparando servicioId:', turnoServicioId, '===', servicioId, '?', matchById);
              console.log('Comparando servicioNombre:', turnoServicioNombre, '===', selectedServiceName, '?', matchByName);
              return matchById || matchByName;
            })
            .map((t: any) => {
              console.log('Mapeando turno:', t);
              return {
                id: t.turnoId,
                fecha: this.normalizeDate(t.fecha),
                hora: t.hora,
                clienteNombre: t.clienteNombre || 'Cliente',
                estado: t.estado,
                estadoAsistencia: t.estadoAsistencia || t.estado || 'pendiente',
                servicioNombre: t.servicioNombre || t.serviceName || this.selectedService?.nombre || '',
                duracion: t.duracion || this.selectedService?.duracion || 0,
                precio: this.selectedService?.precio || 0
              };
            })
            .sort((a: any, b: any) => a.fecha.getTime() - b.fecha.getTime());
          
          console.log('Turnos filtrados y mapeados:', this.serviceAppointments);
        } else {
          console.warn('No hay turnos en la respuesta:', response);
          this.serviceAppointments = [];
        }
      },
      error: (err: any) => {
        console.error('Error cargando turnos del servicio:', err);
        this.serviceAppointments = [];
      }
    });
  }

  addScheduleToService(): void {
    if (!this.selectedService) return;

    const servicioId = this.selectedService.servicioId || this.selectedService.id;
    if (!servicioId) return;

    const horario = {
      servicioId: servicioId,
      horarios: [{
        dia: this.newSchedule.dia,
        horaInicio: this.newSchedule.horaInicio,
        horaFin: this.newSchedule.horaFin,
        disponible: this.newSchedule.disponible
      }]
    };

    this.serviciosService.establecerHorarios(horario).subscribe({
      next: (response: any) => {
        if (response.exito) {
          alert('✓ Horario configurado exitosamente');
          this.loadServices();
          this.viewServiceDetails(this.selectedService);
        }
      },
      error: (err: any) => {
        console.error('Error configurando horario:', err);
        alert('Error al configurar horario');
      }
    });
  }

  getAppointmentsByDay(day: string): any[] {
    const dayMap: { [key: string]: number } = {
      'domingo': 0, 'lunes': 1, 'martes': 2, 'miércoles': 3,
      'jueves': 4, 'viernes': 5, 'sábado': 6
    };
    
    return this.serviceAppointments.filter((apt: any) => {
      const aptDay = apt.fecha.getDay();
      return aptDay === dayMap[day];
    });
  }

  updateAttendance(appointment: any, estadoAsistencia: 'presente' | 'ausente' | 'cancelado' | 'reprogramado'): void {
    this.turnosService.actualizarAsistencia(appointment.id, estadoAsistencia).subscribe({
      next: () => {
        appointment.estadoAsistencia = estadoAsistencia;
        appointment.estado = estadoAsistencia === 'cancelado' ? 'cancelado' : appointment.estado;
      },
      error: (err: any) => {
        console.error('Error actualizando asistencia:', err);
        alert('No se pudo actualizar la asistencia');
      }
    });
  }

  private normalizeDate(value: any): Date {
    if (!value) return new Date('');
    if (value?.toDate) return value.toDate();
    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date(value);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: () => {
        this.router.navigate(['/']);
      }
    });
  }
}
