import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'] 
})
export class App implements OnInit {
  isLoading = true;

  constructor(public authService: AuthService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.verificarSesion();
    this.escucharTimerSesion();
  }

  verificarSesion(): void {
    console.log('1) Iniciando verificación de sesión...');
    
    if (this.authService.isLoggedIn()) {
      console.log('2) Token detectado, llamando a autorizar...');
      
      this.authService.autorizar().subscribe({
        next: (user) => {
          console.log('3) Sesión autorizada:', user);
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          // El interceptor ya meneja el redirect
          console.error('Error en autorización:', err);
          this.isLoading = false; 
          this.cdr.detectChanges();
        }
      });
    } else {
      console.log('No hay token, cargando app pública.');
      this.isLoading = false;
    }
  }

  // 2. Escuchar aviso de expiración (Timer)
  escucharTimerSesion(): void {
    this.authService.showSessionWarning$.subscribe((mostrar) => {
      if (mostrar) {
        this.mostrarModalExtension();
      }
    });
  }

  mostrarModalExtension(): void {
    Swal.fire({
      title: 'Tu sesión está por expirar',
      text: '¿Deseas extender tu sesión por 15 minutos más?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, extender',
      cancelButtonText: 'No, salir',
      confirmButtonColor: '#8b5cf6',
      allowOutsideClick: false
    }).then((result) => {
      if (result.isConfirmed) {
        this.authService.refreshToken().subscribe({
          error: () => {
            Swal.fire('Error', 'No se pudo renovar la sesión', 'error');
            this.authService.logout();
          }
        });
      } else {
        this.authService.logout();
      }
    });
  }
}