import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Publication, PublicationsResponse } from '../models/publication.interface';

@Injectable({
    providedIn: 'root'
})
export class PublicationService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) {}

    // GET: Listar
    getPublications(offset: number, limit: number, sortBy: string): Observable<PublicationsResponse> {
        let params = new HttpParams()
        .set('offset', offset.toString())
        .set('limit', limit.toString())
        .set('sortBy', sortBy);

        return this.http.get<PublicationsResponse>(`${this.apiUrl}/publications`, { params });
    }

    // GET: Por usuario (Perfil)
    getPublicationsByUser(userId: string, limit?: number): Observable<PublicationsResponse> {
        let params = new HttpParams().set('userId', userId);
        
        if (limit) {
        params = params.set('limit', limit.toString());
        }
        
        return this.http.get<PublicationsResponse>(`${this.apiUrl}/publications`, { params });
    }

    // GET /publications/:id - Obtiene una publicación única
    getPublicationById(id: string): Observable<Publication> {
        return this.http.get<Publication>(`${this.apiUrl}/publications/${id}`);
    }

    createPublication(formData: FormData): Observable<Publication> {
        const backendData = new FormData();
        if (formData.has('title')) backendData.append('titulo', formData.get('title') as string);
        if (formData.has('message')) backendData.append('descripcion', formData.get('message') as string);
        if (formData.has('image')) backendData.append('image', formData.get('image') as Blob);

        return this.http.post<Publication>(`${this.apiUrl}/publications`, backendData);
    }

    deletePublication(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/publications/${id}`);
    }

    likePublication(id: string): Observable<Publication> {
        return this.http.post<Publication>(`${this.apiUrl}/publications/${id}/like`, {});
    }

    unlikePublication(id: string): Observable<Publication> {
        return this.http.delete<Publication>(`${this.apiUrl}/publications/${id}/like`);
    }


    // --- COMENTARIOS ---
    getComments(publicationId: string, offset: number = 0, limit: number = 5): Observable<any> {
        const params = new HttpParams()
        .set('offset', offset.toString())
        .set('limit', limit.toString());
        return this.http.get(`${this.apiUrl}/publications/${publicationId}/comments`, { params });
    }

    createComment(publicationId: string, message: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/publications/${publicationId}/comments`, { message });
    }

    deleteComment(publicationId: string, commentId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/publications/${publicationId}/comments/${commentId}`);
    }

    updateComment(publicationId: string, commentId: string, message: string): Observable<any> {
        return this.http.put(`${this.apiUrl}/publications/${publicationId}/comments/${commentId}`, { message });
    }
}