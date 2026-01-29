import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ImageCropperComponent, ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ImageCropperComponent],
  templateUrl: './register.html',
})
export class Register {
  registerForm: FormGroup;
  isLoading = false;

  // Image Cropper State
  imageChangedEvent: any = null;
  croppedImage: SafeUrl = '';
  croppedImageBlob: Blob | null = null;
  showCropper = false;
  imageSelected = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/), Validators.minLength(3), Validators.maxLength(20)]],
      surname: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/), Validators.minLength(4), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/)]],
      confirmPassword: ['', Validators.required],
      birthdate: ['', Validators.required],
      description: [''],
    });
  }

  // Maneja la selección del archivo (inicia el cropper)
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      Swal.fire({
        icon: 'error',
        title: 'Archivo inválido',
        text: 'Por favor selecciona una imagen válida',
        confirmButtonColor: '#8b5cf6',
      });
      return;
    }

    // Validar tamaño (máximo 5MB)
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSizeInBytes) {
      Swal.fire({
        icon: 'error',
        title: 'Archivo muy pesado',
        text: 'La imagen no debe superar los 5MB',
        confirmButtonColor: '#8b5cf6',
      });
      event.target.value = ''; // Limpiar el input
      return;
    }

    // Abrir el cropper
    this.imageChangedEvent = event;
    this.showCropper = true;
    this.imageSelected = false;
  }

  //Se ejecuta cuando la imagen es recortada
  imageCropped(event: ImageCroppedEvent): void {
    if (event.objectUrl) {
      this.croppedImage = this.sanitizer.bypassSecurityTrustUrl(event.objectUrl);
    }
    
    // Guardar el blob para subirlo después
    if (event.blob) {
      this.croppedImageBlob = event.blob;
    }
  }

 // Se ejecuta cuando la imagen termina de cargar
  imageLoaded(image: LoadedImage): void {
    console.log('Imagen cargada en el cropper');
  }

  // Manejo de errores del cropper
  cropperReady(): void {
    console.log('Cropper listo');
  }

  loadImageFailed(): void {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'No se pudo cargar la imagen',
      confirmButtonColor: '#8b5cf6',
    });
  }

 // Confirma el recorte y muestra el preview
  confirmCrop(): void {
    if (!this.croppedImageBlob) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo procesar la imagen',
        confirmButtonColor: '#8b5cf6',
      });
      return;
    }

    this.showCropper = false;
    this.imageSelected = true;
  }

  // Cancela el recorte y resetea el estado
  cancelCrop(): void {
    this.showCropper = false;
    this.imageChangedEvent = null;
    this.croppedImage = '';
    this.croppedImageBlob = null;
    this.imageSelected = false;
  }

  // Elimina la imagen seleccionada
  removeImage(): void {
    this.croppedImage = '';
    this.croppedImageBlob = null;
    this.imageSelected = false;
    this.imageChangedEvent = null;
  }

  // Permite cambiar la imagen seleccionada
  changeImage(): void {
    // Simular click en el input file
    const fileInput = document.getElementById('imageInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
      fileInput.click();
    }
  }

  // Maneja el envío del formulario
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { password, confirmPassword } = this.registerForm.value;
    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Las contraseñas no coinciden',
        text: 'Verificá que ambas sean iguales.',
        confirmButtonColor: '#8b5cf6',
      });
      return;
    }

    this.isLoading = true;

    const formData = new FormData();
    Object.entries(this.registerForm.value).forEach(([key, value]) => {
      if (key !== 'confirmPassword') {
        formData.append(key, value as string);
      }
    });

    // Agregar la imagen recortada si existe
    if (this.croppedImageBlob) {
      formData.append('profilePicture', this.croppedImageBlob, 'profile.jpg');
    }

    this.authService.register(formData).subscribe({
      next: (res) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'success',
          title: '¡Cuenta creada con éxito!',
          text: 'Bienvenido a InstaDev 🎉',
          confirmButtonColor: '#8b5cf6',
          timer: 2000,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          this.router.navigate(['/publicaciones']);
        });
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error al registrar',
          text: this.traduccionError(err.error?.message) || err.error?.message,
          confirmButtonColor: '#8b5cf6',
        });
      },
    });
  }

  traduccionError(msg: string): string {
    switch (msg) {
      case 'Internal server error':
        return 'El nombre de usuario o correo electrónico ya está en uso.';
      case 'Failed to fetch':
        return 'Error de conexión con el servidor. Intente mas tarde';
      default:
        return 'Error desconocido. Intente nuevamente.';
    }
  }
}