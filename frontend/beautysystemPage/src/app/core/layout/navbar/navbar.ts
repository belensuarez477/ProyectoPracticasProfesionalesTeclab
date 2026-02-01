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
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
    tipoUsuario: 'cliente' as 'cliente' | 'profesional'
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
      this.currentUserName = user?.nombre || '';
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
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: () => {
        // Incluso si hay error, limpiamos la sesión localmente
        this.router.navigate(['/']);
      }
    });
  }

  submitLogin(): void {
    if (this.loginForm.email && this.loginForm.password) {
      this.authService.login(this.loginForm.email, this.loginForm.password).subscribe({
        next: (response) => {
          if (response.exito) {
            console.log('Login exitoso desde navbar:', response);
            this.loginForm = { email: '', password: '' };
            this.closeModal();
            this.router.navigate(['/dashboard']).then(
              () => console.log('Navegación al dashboard exitosa'),
              err => console.error('Error navegando:', err)
            );
          } else {
            alert(response.mensaje || 'Email o contraseña incorrectos');
          }
        },
        error: () => {
          alert('Error al conectar con el servidor');
        }
      });
    } else {
      alert('Por favor completa todos los campos');
    }
  }

  submitRegister(): void {
    if (
      this.registerForm.nombre &&
      this.registerForm.apellido &&
      this.registerForm.email &&
      this.registerForm.password &&
      this.registerForm.confirmPassword
    ) {
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        alert('Las contraseñas no coinciden');
        return;
      }

      const registerData = {
        nombre: this.registerForm.nombre,
        apellido: this.registerForm.apellido,
        email: this.registerForm.email,
        telefono: this.registerForm.telefono,
        password: this.registerForm.password,
        tipoUsuario: this.registerForm.tipoUsuario
      };

      this.authService.register(registerData).subscribe({
        next: (response) => {
          console.log('Respuesta del registro:', response);
          if (response.exito) {
            alert('¡Cuenta creada exitosamente! Ahora inicia sesión.');
            this.registerForm = {
              nombre: '',
              apellido: '',
              email: '',
              telefono: '',
              password: '',
              confirmPassword: '',
              tipoUsuario: 'cliente'
            };
            this.closeModal();
            setTimeout(() => this.openModal('login'), 500);
          } else {
            alert(response.mensaje || 'Error al registrar usuario');
          }
        },
        error: (error) => {
          console.error('Error completo:', error);
          const mensaje = error.error?.mensaje || error.error?.error || error.message || 'Error al conectar con el servidor';
          alert('Error: ' + mensaje);
        }
      });
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
