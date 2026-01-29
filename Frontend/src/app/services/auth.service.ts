import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private sessionTimer: any;
  private warningTimer: any;
  
  // Observable para notificar que el componente principal muestre el modal de "Sesion por expirar"
  public showSessionWarning$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {}

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): any {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  // Rutas de autenticación //
  login(credentials: { user: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, {
      identifier: credentials.user,
      password: credentials.password,
    }).pipe(
      tap((response: any) => {
        this.handleLoginSuccess(response);
      })
    );
  }

  register(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register`, formData).pipe(
      tap((response: any) => {
        this.handleLoginSuccess(response);
      })
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.stopTimers();
    this.router.navigate(['/login']);
  }

  // Validar el token al inicio mientras la pagina esta cargando
  autorizar(): Observable<any> {
    const token = this.getToken();
    if (!token) return throwError(() => new Error('No token'));

    // No envia header porque lo maneja con un Interceptor)
    return this.http.post(`${this.apiUrl}/auth/autorizar`, {}).pipe(
      tap((user: any) => {
        // Actualizar datos de usuario si el back los devuelve
        localStorage.setItem('user', JSON.stringify(user));
        this.startSessionTimer(); // Reiniciar timer si es valido
      }),
      catchError((err) => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  // Refrescar el token (Modal de sesión)
  refreshToken(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/refrescar`, {}).pipe(
      tap((response: any) => {
        if (response.token) {
          localStorage.setItem('token', response.token);
          this.showSessionWarning$.next(false); // Ocultar modal
          this.startSessionTimer(); // Reiniciar cuenta atrás
        }
      })
    );
  }

  // Maneja inicio de sesion y guarda el token y usuario en localStorage
  private handleLoginSuccess(response: any): void {
    if (response.token && response.user) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      this.startSessionTimer();
    }
  }

  // Iniciar timers de sesión
  private startSessionTimer(): void {
    this.stopTimers(); // Limpiar timers anteriores

    // A los 10 minutos mostrar aviso
    this.sessionTimer = setTimeout(() => {
      this.showSessionWarning$.next(true); // Activa el modal en App
    }, 10 * 60 * 1000); // 10 minutos
  }

  // Detener timers de sesión
  private stopTimers(): void {
    if (this.sessionTimer) clearTimeout(this.sessionTimer);
    this.showSessionWarning$.next(false);
  }
}