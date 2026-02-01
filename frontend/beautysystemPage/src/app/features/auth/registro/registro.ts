import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RegisterData } from '../../../services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class Registro {
  formData: RegisterData = {
    email: '',
    password: '',
    nombre: '',
    apellido: '',
    telefono: '',
    tipoUsuario: 'cliente'
  };
  confirmPassword: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    // Validaciones
    if (!this.formData.email || !this.formData.password || !this.formData.nombre || 
        !this.formData.apellido || !this.formData.telefono) {
      this.errorMessage = 'Por favor completa todos los campos';
      return;
    }

    if (this.formData.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    if (this.formData.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.formData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.exito) {
          this.successMessage = 'Registro exitoso. Redirigiendo...';
          console.log('Registro exitoso:', response);
          console.log('Usuario:', response.usuario);
          
          // Redirigir después de 1 segundo
          setTimeout(() => {
            console.log('Redirigiendo al dashboard...');
            this.router.navigate(['/dashboard']).then(
              () => console.log('Navegación exitosa'),
              err => console.error('Error en navegación:', err)
            );
          }, 1000);
        } else {
          this.errorMessage = response.mensaje || 'Error al registrar usuario';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = 'Error de conexión con el servidor';
        console.error('Error en registro:', error);
      }
    });
  }

  onTipoUsuarioChange(tipo: 'cliente' | 'profesional'): void {
    this.formData.tipoUsuario = tipo;
  }
}

