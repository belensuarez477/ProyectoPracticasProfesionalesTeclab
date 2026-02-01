import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../../services/auth.service';
import { ServiciosService, Servicio } from '../../../../services/servicios.service';
import { TurnosService } from '../../../../services/turnos.service';

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
  selectedService: any = null;
  serviceAppointments: any[] = [];
  selectedDay: string = 'lunes';
  daysOfWeek = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

  newAppointment = {
    date: '',
    time: '',
    clientName: '',
    service: ''
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
    private authService: AuthService,
    private router: Router,
    private serviciosService: ServiciosService,
    private turnosService: TurnosService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('Usuario actual en dashboard:', this.currentUser);
    console.log('Token en localStorage:', this.authService.getToken() ? 'SÍ HAY TOKEN' : 'NO HAY TOKEN');

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
  }

  loadAppointments(): void {
    if (this.currentUser?.tipoUsuario === 'profesional') {
      this.turnosService.obtenerTurnosProfesional().subscribe({
        next: (response: any) => {
          if (response.exito && response.turnos) {
            this.appointments = response.turnos.map((t: any) => ({
              id: t.id,
              date: t.fecha,
              time: t.hora,
              clientName: t.clienteNombre || 'Cliente',
              service: t.servicioNombre || 'Servicio'
            }));
          }
        },
        error: (err: any) => console.error('Error al cargar turnos:', err)
      });
    } else {
      this.turnosService.obtenerTurnosCliente().subscribe({
        next: (response: any) => {
          if (response.exito && response.turnos) {
            this.appointments = response.turnos.map((t: any) => ({
              id: t.id,
              date: t.fecha,
              time: t.hora,
              clientName: 'Yo',
              service: t.servicioNombre || 'Servicio'
            }));
          }
        },
        error: (err: any) => console.error('Error al cargar turnos:', err)
      });
    }
  }

  loadServices(): void {
    this.isLoading = true;
    console.log('Iniciando carga de servicios...');
    this.serviciosService.obtenerServicios().subscribe({
      next: (response: any) => {
        console.log('Servicios obtenidos:', response);
        this.isLoading = false;
        if (response.exito && response.servicios) {
          this.services = response.servicios;
          console.log('Servicios cargados exitosamente:', this.services.length);
        } else {
          this.services = [];
          console.warn('Respuesta sin servicios o sin exito:', response);
        }
      },
      error: (err: any) => {
        console.error('Error al cargar servicios:', err);
        console.error('Status:', err.status);
        console.error('Error completo:', err.error);
        this.isLoading = false;
        this.services = [];
        
        if (err.status === 0) {
          alert('No se puede conectar con el backend. Verifica que esté corriendo en http://localhost:5000');
        } else if (err.status === 401) {
          alert('Sesión expirada. Por favor inicia sesión nuevamente.');
          this.authService.logout();
          this.router.navigate(['/']);
        }
      }
    });
  }

  addAppointment(): void {
    if (this.newAppointment.date && this.newAppointment.time &&
      this.newAppointment.clientName && this.newAppointment.service) {

      const appointment: Appointment = {
        id: Date.now().toString(),
        ...this.newAppointment
      };

      this.appointments.push(appointment);

      alert('¡Turno agendado exitosamente!');
      this.newAppointment = { date: '', time: '', clientName: '', service: '' };
    } else {
      alert('Por favor completa todos los campos');
    }
  }

  deleteAppointment(id: string): void {
    this.appointments = this.appointments.filter(a => a.id !== id);
  }

  addService(): void {
    if (this.newService.nombre && this.newService.precio > 0) {
      this.isLoading = true;

      this.serviciosService.crearServicio(this.newService).subscribe({
        next: (response: any) => {
          console.log('Respuesta crear servicio:', response);
          if (response.exito) {
            this.isLoading = false;
            this.newService = { nombre: '', descripcion: '', duracion: 30, precio: 0 };
            this.loadServices();
            alert('✓ ' + response.mensaje);
          } else {
            this.isLoading = false;
            alert('Error: ' + response.mensaje);
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          console.error('Error completo al crear servicio:', err);
          console.error('Status:', err.status);
          console.error('Error body:', err.error);
          
          let mensaje = 'Error desconocido';
          if (err.status === 0) {
            mensaje = 'No se puede conectar con el servidor. Verifica que el backend esté corriendo en http://localhost:5000';
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
    this.loadServiceAppointments(service.servicioId);
  }

  closeServiceDetails(): void {
    this.selectedService = null;
    this.serviceAppointments = [];
  }

  loadServiceAppointments(servicioId: string): void {
    console.log('Cargando turnos para servicioId:', servicioId);
    // Obtener todos los turnos del profesional y filtrar por servicio
    this.turnosService.obtenerTurnosProfesional().subscribe({
      next: (response: any) => {
        console.log('Respuesta de turnos del profesional:', response);
        if (response.exito && response.turnos) {
          console.log('Turnos obtenidos, cantidad:', response.turnos.length);
          console.log('Filtrando por servicioId:', servicioId);
          
          this.serviceAppointments = response.turnos
            .filter((t: any) => {
              console.log('Comparando servicioId:', t.servicioId, '===', servicioId, '?', t.servicioId === servicioId);
              return t.servicioId === servicioId;
            })
            .map((t: any) => {
              console.log('Mapeando turno:', t);
              return {
                id: t.turnoId,
                fecha: t.fecha?.toDate ? t.fecha.toDate() : new Date(t.fecha),
                hora: t.hora,
                clienteNombre: t.clienteNombre || 'Cliente',
                estado: t.estado,
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

    const horario = {
      servicioId: this.selectedService.servicioId,
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
