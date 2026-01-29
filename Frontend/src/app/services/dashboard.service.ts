import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // GET /dashboard/stats - Para los gráficos
getStats(from?: string, to?: string): Observable<any> {
    let params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;

    return this.http.get(`${this.apiUrl}/dashboard/stats`, { params });
  }

  // GET /dashboard/users - Listado completo para admin
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/dashboard/users`);
  }

  // POST /dashboard/users/:id/status - Habilitar/Deshabilitar
  changeUserStatus(id: string, action: 'enable' | 'disable'): Observable<any> {
    return this.http.post(`${this.apiUrl}/dashboard/users/${id}/status`, { action });
  }
}
