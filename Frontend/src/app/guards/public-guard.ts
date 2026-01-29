import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // Usuario YA logueado, redirigir a publicaciones
    return router.createUrlTree(['/publicaciones']);
  }

  // Usuario no logueado, permitir acceso a login/registro
  return true;
};
