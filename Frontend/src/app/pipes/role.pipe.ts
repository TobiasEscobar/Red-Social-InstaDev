import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'role',
  standalone: true
})
export class RolePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value === 'administrador' ? 'Administrador' : 'Usuario';
  }
}
