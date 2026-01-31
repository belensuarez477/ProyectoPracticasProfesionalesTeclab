import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {
  activeModal: string | null = null;
  isAuthenticated = false;
  currentUserName = '';

  loginForm = {
    email: '',
    password: ''
  };

  registerForm = {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  };

  contactForm = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  constructor(private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = user !== null;
      this.currentUserName = user?.name || '';
    });
  }

  openModal(modalName: string): void {
    this.activeModal = modalName;
  }

  closeModal(): void {
    this.activeModal = null;
  }

  navigateHome(): void {
    this.router.navigate(['/']);
  }

  navigateDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  submitLogin(): void {
    if (this.loginForm.email && this.loginForm.password) {
      const success = this.authService.login(this.loginForm.email, this.loginForm.password);
      
      if (success) {
        alert('¡Iniciando sesión!');
        this.loginForm = { email: '', password: '' };
        this.closeModal();
        this.navigateDashboard();
      } else {
        alert('Email o contraseña incorrectos');
      }
    } else {
      alert('Por favor completa todos los campos');
    }
  }

  submitRegister(): void {
    if (
      this.registerForm.name &&
      this.registerForm.email &&
      this.registerForm.password &&
      this.registerForm.confirmPassword
    ) {
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }

      const success = this.authService.register(
        this.registerForm.name,
        this.registerForm.email,
        this.registerForm.phone,
        this.registerForm.password
      );

      if (success) {
        alert('¡Cuenta creada exitosamente! Ahora inicia sesión.');
        this.registerForm = {
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: ''
        };
        this.closeModal();
        setTimeout(() => this.openModal('login'), 500);
      } else {
        alert('Este email ya está registrado');
      }
    } else {
      alert('Por favor completa todos los campos requeridos');
    }
  }

  submitContact(): void {
    if (
      this.contactForm.name &&
      this.contactForm.email &&
      this.contactForm.subject &&
      this.contactForm.message
    ) {
      console.log('Contact submitted:', this.contactForm);
      alert('¡Mensaje enviado correctamente! Nos contactaremos pronto.');
      this.contactForm = {
        name: '',
        email: '',
        subject: '',
        message: ''
      };
      this.closeModal();
    } else {
      alert('Por favor completa todos los campos');
    }
  }
}
