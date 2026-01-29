import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();

  let request = req;

  // Adjuntar Token si existe
  if (token) {
    request = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Manejar Errores
  return next(request).pipe(
    catchError((error) => {
      if (error.status === 401) {
        // Si el token esta vencido o es invalido provocar un logout forzado
        authService.logout();
      }
      return throwError(() => error);
    })
  );
};
