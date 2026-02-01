import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  email: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.exito) {
          console.log('Login exitoso:', response);
          console.log('Usuario:', response.usuario);
          console.log('Redirigiendo al dashboard...');
          // Redirigir al dashboard
          this.router.navigate(['/dashboard']).then(
            () => console.log('Navegación exitosa'),
            err => console.error('Error en navegación:', err)
          );
        } else {
          this.errorMessage = response.mensaje || 'Error al iniciar sesión';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error de conexión con el servidor';
        console.error('Error en login:', error);
      }
    });
  }
}

