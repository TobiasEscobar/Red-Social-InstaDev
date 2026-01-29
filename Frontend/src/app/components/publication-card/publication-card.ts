import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Publication } from '../../models/publication.interface';
import Swal from 'sweetalert2';
import { TimeAgoPipe } from '../../pipes/time-ago.pipe';
import { LazyImageDirective } from '../../directives/lazy-image.directive';
import { InitialsPipe } from '../../pipes/initials.pipe';

@Component({
  selector: 'app-publication-card',
  standalone: true,
  imports: [CommonModule, TimeAgoPipe, LazyImageDirective, InitialsPipe],
  templateUrl: './publication-card.html',
})
export class PublicationCardComponent {
  @Input() publication!: Publication;
  @Input() currentUserId!: string;
  @Input() isAdmin = false;

  @Output() onLike = new EventEmitter<string>();
  @Output() onUnlike = new EventEmitter<string>();
  @Output() onDelete = new EventEmitter<string>();

  constructor(private router: Router) {}

  get hasLiked(): boolean {
    // Si publication o likes son undefined, devuelve false en lugar de error
    return this.publication?.likes?.includes(this.currentUserId) ?? false;
  }

  get canDelete(): boolean {
    return this.isAdmin || this.publication?.author?._id === this.currentUserId;
  }

  alternarLike(event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    if (this.hasLiked) {
      this.onUnlike.emit(this.publication._id);
    } else {
      this.onLike.emit(this.publication._id);
    }
  }

  borrarPost(event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.onDelete.emit(this.publication._id);
  }

  verComentarios(event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.router.navigate(['/publicacion', this.publication._id]);
  }

  verImagenCompleta(event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    if (this.publication.imageUrl) {
      Swal.fire({
        imageUrl: this.publication.imageUrl,
        imageAlt: this.publication.title,
        showConfirmButton: false,
        showCloseButton: true,
        background: '#1f2937',
        customClass: {
          image: 'rounded-lg max-h-[80vh]'
        }
      });
    }
  }
}