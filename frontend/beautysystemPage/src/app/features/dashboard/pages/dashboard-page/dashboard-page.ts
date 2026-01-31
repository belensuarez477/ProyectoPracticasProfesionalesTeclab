import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, User } from '../../../../services/auth.service';

interface Appointment {
  id: string;
  date: string;
  time: string;
  clientName: string;
  service: string;
}

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
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
  services: Service[] = [];
  activeTab = 'profile';

  newAppointment = {
    date: '',
    time: '',
    clientName: '',
    service: ''
  };

  newService = {
    name: '',
    duration: 30,
    price: 0
  };

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    if (!this.currentUser) {
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
    const key = `appointments_${this.currentUser?.id}`;
    const data = localStorage.getItem(key);
    this.appointments = data ? JSON.parse(data) : [];
  }

  loadServices(): void {
    const key = `services_${this.currentUser?.id}`;
    const data = localStorage.getItem(key);
    this.services = data ? JSON.parse(data) : [];
  }

  saveAppointments(): void {
    const key = `appointments_${this.currentUser?.id}`;
    localStorage.setItem(key, JSON.stringify(this.appointments));
  }

  saveServices(): void {
    const key = `services_${this.currentUser?.id}`;
    localStorage.setItem(key, JSON.stringify(this.services));
  }

  addAppointment(): void {
    if (this.newAppointment.date && this.newAppointment.time && 
        this.newAppointment.clientName && this.newAppointment.service) {
      
      const appointment: Appointment = {
        id: Date.now().toString(),
        ...this.newAppointment
      };
      
      this.appointments.push(appointment);
      this.saveAppointments();
      
      alert('¡Turno agendado exitosamente!');
      this.newAppointment = { date: '', time: '', clientName: '', service: '' };
    } else {
      alert('Por favor completa todos los campos');
    }
  }

  deleteAppointment(id: string): void {
    this.appointments = this.appointments.filter(a => a.id !== id);
    this.saveAppointments();
  }

  addService(): void {
    if (this.newService.name && this.newService.price > 0) {
      const service: Service = {
        id: Date.now().toString(),
        ...this.newService
      };
      
      this.services.push(service);
      this.saveServices();
      
      alert('¡Servicio agregado exitosamente!');
      this.newService = { name: '', duration: 30, price: 0 };
    } else {
      alert('Por favor completa todos los campos');
    }
  }

  deleteService(id: string): void {
    this.services = this.services.filter(s => s.id !== id);
    this.saveServices();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
