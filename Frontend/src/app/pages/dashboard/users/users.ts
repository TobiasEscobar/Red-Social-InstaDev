import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { DashboardService } from '../../../services/dashboard.service';
import { UserService } from '../../../services/user.service';
import { RolePipe } from '../../../pipes/role.pipe';
import { StatusBadgeDirective } from '../../../directives/status-badge.directive';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RolePipe, StatusBadgeDirective],
  templateUrl: './users.html'
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  userForm: FormGroup;
  selectedFile: File | null = null; // Para guardar la foto seleccionada

  constructor(
    private dashboardService: DashboardService,
    private userService: UserService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    // Formulario completo con los campos requeridos por el Back
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/), Validators.minLength(3), Validators.maxLength(20)]],
      surname: ['', [Validators.required, Validators.pattern(/^[a-zA-ZÀ-ÿ\u00f1\u00d1\s]+$/), Validators.minLength(3), Validators.maxLength(20)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[A-Z])(?=.*\d)/)]],
      confirmPassword: ['', Validators.required],
      birthdate: ['', Validators.required],
      description: [''],
      role: ['usuario', Validators.required]
    });
  }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.dashboardService.getUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error cargando usuarios', err)
    });
  }

  // Captura el archivo cuando el usuario lo selecciona
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    if (this.userForm.value.password !== this.userForm.value.confirmPassword) {
      Swal.fire('Error', 'Las contraseñas no coinciden', 'error');
      return;
    }

    const formData = new FormData();
    
    // Agregar todos los campos del form
    Object.keys(this.userForm.value).forEach(key => {
      if (key !== 'confirmPassword') { // <--- FILTRARLO
        const value = this.userForm.value[key];
        if (value) formData.append(key, value);
      }
    });

    // Agrega la foto si existe 
    if (this.selectedFile) {
      formData.append('profilePicture', this.selectedFile);
    }

    this.userService.createUser(formData).subscribe({
      next: () => {
        Swal.fire('Éxito', 'Usuario creado correctamente', 'success');
        
        // Resetear formulario y archivo
        this.userForm.reset({ role: 'usuario' });
        this.selectedFile = null;
        
        // Limpiar el input file visualmente
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if(fileInput) fileInput.value = '';

        this.loadUsers();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', err.error?.message || 'No se pudo crear el usuario', 'error');
      }
    });
  }

  toggleUserStatus(user: any) {
    const action = user.isActive ? 'disable' : 'enable';
    
    const currentState = user.isActive !== undefined ? user.isActive : user.active;
    const newAction = currentState ? 'disable' : 'enable';

    this.dashboardService.changeUserStatus(user._id, newAction).subscribe({
      next: (res) => {
        user.isActive = !currentState; 
        user.active = !currentState;
        
        const msg = newAction === 'enable' ? 'Habilitado' : 'Deshabilitado';
        Swal.fire(msg, `El usuario ha sido ${msg.toLowerCase()}`, 'success');
        this.cdr.detectChanges();
      },
      error: () => Swal.fire('Error', 'No se pudo cambiar el estado', 'error')
    });
  }
}