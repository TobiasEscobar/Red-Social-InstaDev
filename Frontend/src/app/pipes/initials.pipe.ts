import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'initials',
  standalone: true
})
export class InitialsPipe implements PipeTransform {
  transform(name: string | undefined): string {
    if (!name) return '';
    
    const parts = name.trim().split(' ');
    
    // Si solo tiene un nombre, devuelve la primera letra
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    
    // Si tiene más, devuelve la primera letra del primero y del último
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }
}
