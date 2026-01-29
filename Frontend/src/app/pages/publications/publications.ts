import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Nav } from '../../components/nav/nav';
import { PublicationCardComponent } from '../../components/publication-card/publication-card';
import { PublicationService } from '../../services/publication.service';
import { Publication } from '../../models/publication.interface';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-publications',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    Nav,
    PublicationCardComponent
  ],
  templateUrl: './publications.html',
})
export class Publications implements OnInit {
  // Estado de publicaciones
  publications: Publication[] = [];
  
  // Estado de carga
  isLoading = false;
  isSubmitting = false;
  
  // Paginación
  currentPage = 1;
  totalPages = 1;
  limit = 4;
  
  // Ordenamiento
  sortBy: 'date' | 'likes' = 'date';
  
  // Usuario actual
  currentUserId = '';
  isAdmin = false;
  
  // Modal
  showCreateModal = false;
  createPostForm: FormGroup;
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private publicationService: PublicationService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.createPostForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(25)]],
      message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(140)]],
    });
  }

  ngOnInit(): void {
    this.cargarUsuarioActual();
    this.cargarPublicaciones();
  }

  
  cargarUsuarioActual(): void {
    console.log('Cargando usuario actual desde localStorage');
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      this.currentUserId = user._id || user.id;
      this.isAdmin = user.role === 'administrador';
    }
  }

  cargarPublicaciones(): void {
    this.isLoading = true;
    // console.log(`Cargando publicaciones - Página: ${this.currentPage}, Ordenar por: ${this.sortBy}`);
    
    const offset = (this.currentPage - 1) * this.limit;
    
    this.publicationService.getPublications(offset, this.limit, this.sortBy)
      .subscribe({
        next: (response) => {
          this.publications = response.data;
          this.totalPages = Math.ceil(response.total / this.limit);
          this.isLoading = false;
          this.cdr.detectChanges();
          // console.log('Publicaciones cargadas:', this.publications);
        },
        error: (err) => {
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Error al cargar publicaciones',
            text: 'No se pudieron cargar las publicaciones. Intenta nuevamente.',
            confirmButtonColor: '#8b5cf6',
          });
          console.error('Error cargando publicaciones:', err);
        
          this.cdr.detectChanges();
        }
      });
  }

  onSortChange(): void {
    this.currentPage = 1; // Volver a la primera página
    this.cargarPublicaciones(); // Cargar inmediatamente
  }

  // Navega a la pagina anterior
  paginaAnterior(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.cargarPublicaciones();
      this.scrollToTop();
    }
  }

  // Navega a la siguiente pagina
  paginaSiguiente(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.cargarPublicaciones();
      this.scrollToTop();
    }
  }

  // Scroll suave al tope de la pagina
  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Abre el modal de crear publicacion
  openCreatePostModal(): void {
    this.showCreateModal = true;
    this.createPostForm.reset();
    this.selectedFile = null;
    this.imagePreview = null;
  }

  // Cierra el modal de crear publicacion
  closeCreatePostModal(): void {
    this.showCreateModal = false;
    this.createPostForm.reset();
    this.selectedFile = null;
    this.imagePreview = null;
  }

  // Al seleccionar un archivo, crea el preview
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Elimina la imagen seleccionada
  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  // Maneja el envío del formulario de creacion de publicacion
  onSubmitPost(): void {
    if (this.createPostForm.invalid) {
      this.createPostForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const formData = new FormData();
    formData.append('title', this.createPostForm.value.title);
    formData.append('message', this.createPostForm.value.message);
    
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.publicationService.createPublication(formData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        
        // Cerrar el modal antes de mostrar el mensaje
        this.closeCreatePostModal();
        
        // Mostrar mensaje de éxito
        Swal.fire({
          icon: 'success',
          title: '¡Publicación creada!',
          text: 'Tu publicación se ha compartido exitosamente.',
          confirmButtonColor: '#8b5cf6',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        });

        // Recargar publicaciones para mostrar la nueva
        this.currentPage = 1;
        this.cargarPublicaciones();
      },
      error: (err) => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'error',
          title: 'Error al publicar',
          text: 'No se pudo crear la publicación. Intenta nuevamente.',
          confirmButtonColor: '#8b5cf6',
        });
        console.error('Error creando publicación:', err);
      }
    });
  }

  darLike(publicationId: string): void {
    const pub = this.publications.find(p => p._id === publicationId);
    
    if (pub) {
        if (!pub.likes) pub.likes = []; 
        
        if (!pub.likes.includes(this.currentUserId)) {
            pub.likes.push(this.currentUserId);
        }
    }

    this.publicationService.likePublication(publicationId).subscribe({
      next: () => { },
      error: (err) => {
        if (pub && pub.likes) {
          pub.likes = pub.likes.filter(id => id !== this.currentUserId);
        }
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo dar like. Intenta nuevamente.',
          confirmButtonColor: '#8b5cf6',
        });
      }
    });
  }

  quitarLike(publicationId: string): void {
    const pub = this.publications.find(p => p._id === publicationId);
    
    if (pub && pub.likes) { // Solo procesar si existe el array
      pub.likes = pub.likes.filter(id => id !== this.currentUserId);
    }

    this.publicationService.unlikePublication(publicationId).subscribe({
      next: () => { },
      error: (err) => {
        if (pub) {
            if (!pub.likes) pub.likes = [];
            if (!pub.likes.includes(this.currentUserId)) {
                pub.likes.push(this.currentUserId);
            }
        }
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo quitar el like. Intenta nuevamente.',
          confirmButtonColor: '#8b5cf6',
        });
      }
    });
  }

  // Manejar el evento de eliminar publicacion
  manejarBorrar(publicationId: string): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
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
            Swal.fire({
              icon: 'success',
              title: 'Publicación eliminada',
              confirmButtonColor: '#8b5cf6',
              timer: 1500,
              showConfirmButton: false,
            });
            
            // Eliminar de la lista local
            this.publications = this.publications.filter(p => p._id !== publicationId);
            
            // Si no quedan publicaciones en esta pagina, ir a la anterior
            if (this.publications.length === 0 && this.currentPage > 1) {
              this.currentPage--;
              this.cargarPublicaciones();
            }
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: 'Error al eliminar',
              text: 'No se pudo eliminar la publicación.',
              confirmButtonColor: '#8b5cf6',
            });
            console.error('Error eliminando publicación:', err);
          }
        });
      }
    });
  }
}

