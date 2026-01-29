import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
})
export class Login {
  loginForm: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      user: ['', [Validators.required]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/),
        ],
      ],
    });
  }

  get user() {
    return this.loginForm.get('user');
  }
  get password() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: 'Inicio de sesión exitoso',
          text: `Bienvenido ${res.user?.username || res.user?.email} 👋`,
          confirmButtonColor: '#8b5cf6',
          timer: 1800,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          this.router.navigate(['/publicaciones']);
        });
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error al registrar',
          text: this.traduccionError(err.error?.message) || err.error?.message,
          confirmButtonColor: '#8b5cf6',
        });
      }
    });
  }

  traduccionError(msg: string): string {
    switch (msg) {
      case 'Internal server error':
        return 'Correo/usuario o contraseña incorrecta.';
      case 'Failed to fetch':
        return 'Error de conexión con el servidor. Intente mas tarde';
      default:
        return msg;
    }
  }

  goToRegister(): void {
    this.router.navigate(['registro']);
  }
}
