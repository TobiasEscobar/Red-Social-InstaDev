// (cloudinary) Servicio de usuarios con funcionalidad de subida de imagen
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateUserDto, User } from '../models/user.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  register(userData: CreateUserDto): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users/register`, userData);
  }

  // POST /users/upload-avatar - Subir imagen de perfil
  uploadAvatar(file: File): Observable<User> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.http.post<User>(`${this.apiUrl}/users/upload-avatar`, formData);
  }

  // Admin methods
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  createUser(userData: FormData): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/users`, userData);
  }

  disableUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }

  enableUser(id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/users/${id}/restore`, {});
  }
}