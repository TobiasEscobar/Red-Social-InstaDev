import { Directive, ElementRef, Input, OnChanges, Renderer2 } from '@angular/core';

@Directive({
    selector: '[appStatusBadge]',
    standalone: true
})
export class StatusBadgeDirective implements OnChanges {
    @Input() appStatusBadge: boolean | undefined = false;

    constructor(private el: ElementRef, private renderer: Renderer2) {
        // Estilos base (clases de Tailwind comunes)
        const baseClasses = ['px-2', 'py-1', 'rounded', 'text-xs', 'font-semibold', 'inline-flex', 'items-center', 'gap-1'];
        baseClasses.forEach(c => this.el.nativeElement.classList.add(c));
    }

    ngOnChanges() {
        const isActive = this.appStatusBadge;

        // Limpia clases de color previas para evitar conflictos
        this.el.nativeElement.classList.remove('bg-green-900', 'text-green-300', 'bg-red-900', 'text-red-300');

        if (isActive) {
        this.renderer.addClass(this.el.nativeElement, 'bg-green-900');
        this.renderer.addClass(this.el.nativeElement, 'text-green-300');
        } else {
        this.renderer.addClass(this.el.nativeElement, 'bg-red-900');
        this.renderer.addClass(this.el.nativeElement, 'text-red-300');
        }
    }
}