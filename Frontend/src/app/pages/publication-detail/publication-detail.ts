import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicationService } from '../../services/publication.service';
import { AuthService } from '../../services/auth.service';
import { Nav } from '../../components/nav/nav';
import { PublicationCardComponent } from '../../components/publication-card/publication-card';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-publication-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, Nav, PublicationCardComponent],
  templateUrl: './publication-detail.html',
})
export class PublicationDetail implements OnInit {
  publication: any = null;
  comments: any[] = [];
  
  // Estado de carga
  isLoading = true;
  loadingComments = false;
  
  // Paginación
  offset = 0;
  limit = 5;
  hasMoreComments = true;

  // Usuario actual
  currentUserId = '';
  isAdmin = false;

  // Inputs
  newComment = '';
  editingCommentId: string | null = null;
  editCommentText = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private publicationService: PublicationService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
        this.currentUserId = user._id;
        this.isAdmin = user.role === 'administrador';
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.cargarPublicacion(id);
    }
  }

  cargarPublicacion(id: string) {
    this.isLoading = true;
    this.publicationService.getPublicationById(id).subscribe({
      next: (pub) => {
        this.publication = pub;
        this.isLoading = false;

        // Cargar primeros comentarios
        this.cargarComentarios(id); 
        this.cdr.detectChanges();
      },
      error: () => {
        this.router.navigate(['/publicaciones']);
      }
    });
  }

  cargarComentarios(id: string) {
    // Si ya estan todos los comentarios cargados, no busca cargar mas
    if (this.publication && this.comments.length >= this.publication.commentsCount) {
        this.hasMoreComments = false;
        return;
    }

    this.loadingComments = true;
    
    this.publicationService.getComments(id, this.offset, this.limit).subscribe({
      next: (newComments) => {
        if (this.offset === 0) {
            this.comments = newComments;
        } else {
            this.comments = [...this.comments, ...newComments];
        }
        
        this.offset += this.limit;
        this.loadingComments = false;
        
        // Logica del boton cargar mas
        // Si la cantidad visible es igual o mayor al total real en la BD, lo oculta
        if (this.publication && this.comments.length >= this.publication.commentsCount) {
          this.hasMoreComments = false;
        } else {
          // Si todavía faltan, mostrar (sirve para cuando se estan creando mas)
          this.hasMoreComments = true;
        }

        this.cdr.detectChanges();
      },
      error: () => {
        this.loadingComments = false;
        this.cdr.detectChanges();
      }
    });
  }

  enviarComentario() {
    this.publicationService.createComment(this.publication._id, this.newComment).subscribe({
      next: (res) => {
        this.newComment = '';
        
        // Actualiza el contador localmente para la logica del boton 
        if(this.publication.commentsCount !== undefined) {
            this.publication.commentsCount++;
        }

        // Reinicia la lista para ver el nuevo comentario al principio
        this.offset = 0;
        this.comments = [];
        this.hasMoreComments = true; // Reactiva el boton por si acaso
        
        this.cargarComentarios(this.publication._id);
        
        this.cdr.detectChanges();
      },
      error: () => Swal.fire('Error', 'No se pudo enviar', 'error')
    });
  }

  borrarComentario(commentId: string) {
    Swal.fire({
      title: '¿Borrar comentario?',
      text: 'No podrás deshacer esto',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.publicationService.deleteComment(this.publication._id, commentId).subscribe({
          next: () => {
            this.comments = this.comments.filter(c => c._id !== commentId);
            this.publication.commentsCount--;
            this.cdr.detectChanges();
          }
        });
      }
    });
  }


  iniciarEdicion(comment: any) {
    this.editingCommentId = comment._id;
    this.editCommentText = comment.message;
  }

  cancelarEdicion() {
    this.editingCommentId = null;
    this.editCommentText = '';
  }

  guardarEdicion(commentId: string) {
    if (!this.editCommentText.trim()) return;

    this.publicationService.updateComment(this.publication._id, commentId, this.editCommentText).subscribe({
      next: () => {
        const comment = this.comments.find(c => c._id === commentId);
        if (comment) {
          comment.message = this.editCommentText;
          comment.modified = true;
        }
        this.cancelarEdicion();
        this.cdr.detectChanges();
      }
    });
  }

  // Helper para el HTML
  canModify(commentUserId: string): boolean {
    return this.isAdmin || commentUserId === this.currentUserId;
  }

  volverHome() {
    this.router.navigate(['/publicaciones']);
  }
}