import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Nav } from '../../components/nav/nav'; 
import { PublicationCardComponent } from '../../components/publication-card/publication-card'; // Reutilizas tu card
import { AuthService } from '../../services/auth.service';
import { PublicationService } from '../../services/publication.service';
import { User } from '../../models/user.interface';
import { Publication } from '../../models/publication.interface';
import Swal from 'sweetalert2';
import { InitialsPipe } from '../../pipes/initials.pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, Nav, PublicationCardComponent, InitialsPipe],
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  
  // Estado del componente
  user: User | null = null;
  publications: Publication[] = [];
  isLoadingUser = true;
  isLoadingPosts = true;

  // IDs para la lógica de las cards
  currentUserId = '';
  isAdmin = false;

  constructor(
    private authService: AuthService,
    private publicationService: PublicationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPerfilDeUsuario();
  }

  // Carga los datos del usuario actual desde el AuthService (localStorage)
  cargarPerfilDeUsuario(): void {
    this.isLoadingUser = true;
    
    const userData = this.authService.getCurrentUser();
    
    if (userData) {
      this.user = userData;
      this.currentUserId = userData._id || userData.id;
      this.isAdmin = userData.role === 'administrador';

      // Carga sus publicaciones
      this.cargarPublicacionesUsuario();

    } else {
      console.error('No se pudo encontrar al usuario en localStorage');
    }
    
    this.isLoadingUser = false;
    this.cdr.detectChanges(); // Forzar deteccion de cambios
  }

  // Cargar las 3 ultimas publicaciones
  cargarPublicacionesUsuario(): void {
    if (!this.currentUserId) return;

    this.isLoadingPosts = true;
    
    // Usamos el servicio para traer publicaciones por 'userId' con un límite de 3
    this.publicationService.getPublicationsByUser(this.currentUserId, 3).subscribe({
      next: (response) => {
        this.publications = response.data;
        this.isLoadingPosts = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando las publicaciones del usuario:', err);
        this.isLoadingPosts = false;
        Swal.fire({
          icon: 'error',
          title: 'Error al cargar publicaciones',
          text: 'No se pudieron cargar tus publicaciones. Intenta nuevamente.',
          confirmButtonColor: '#8b5cf6',
        });
        this.cdr.detectChanges();
      }
    });
  }

  // Lógica de Interacción con las publicaciones 
  // (Es la misma que 'publications.ts', pero opera sobre 'this.publications')
  darLike(publicationId: string): void {
    const pub = this.publications.find(p => p._id === publicationId);
    
    // Verificación de seguridad: Si pub existe pero likes no, lo inicializamos
    if (pub) {
        if (!pub.likes) pub.likes = [];
        
        if (!pub.likes.includes(this.currentUserId)) {
            pub.likes.push(this.currentUserId);
        }
    }

    this.publicationService.likePublication(publicationId).subscribe({
      error: (err) => {
        // Revertir (asegura que pub y likes existan)
        if (pub && pub.likes) {
          pub.likes = pub.likes.filter(id => id !== this.currentUserId);
        }
        console.error('Error dando like:', err);
      }
    });
  }

  quitarLike(publicationId: string): void {
    const pub = this.publications.find(p => p._id === publicationId);
    
    if (pub && pub.likes) { // Filtra solo si likes existe
      pub.likes = pub.likes.filter(id => id !== this.currentUserId);
    }

    this.publicationService.unlikePublication(publicationId).subscribe({
      error: (err) => {
        // Revertir
        if (pub) {
            if (!pub.likes) pub.likes = []; // Inicializar si hace falta
            if (!pub.likes.includes(this.currentUserId)) {
                pub.likes.push(this.currentUserId);
            }
        }
        console.error('Error quitando like:', err);
      }
    });
  }

  manejarBorrar(publicationId: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'No podrás revertir esta acción',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#8b5cf6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.publicationService.deletePublication(publicationId).subscribe({
          next: () => {
            this.publications = this.publications.filter(p => p._id !== publicationId);
            this.cdr.detectChanges();
            Swal.fire({
              icon: 'success',
              title: 'Eliminada',
              text: 'Tu publicación ha sido eliminada.',
              showConfirmButton: false,
              timer: 1500
            });
          },
          error: (err) => {
            console.error('Error eliminando publicación:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo eliminar la publicación.',
              confirmButtonColor: '#8b5cf6',
            });
          }
        });
      }
    });
  }
}
