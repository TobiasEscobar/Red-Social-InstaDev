import { IsNotEmpty, IsOptional, IsString, MinLength, MaxLength } from 'class-validator';

export class CreatePublicationDto {
    @IsNotEmpty({ message: 'El título es obligatorio' })
    @IsString()
    @MinLength(3, { message: 'El título debe tener al menos 3 caracteres' })
    @MaxLength(25, { message: 'El título no puede superar los 25 caracteres' })
    titulo: string;

    @IsNotEmpty({ message: 'El mensaje es obligatorio' })
    @IsString()
    @MinLength(10, { message: 'El mensaje debe tener al menos 10 caracteres' })
    @MaxLength(140, { message: 'El mensaje no puede superar los 140 caracteres' })
    descripcion: string;

    @IsOptional()
    @IsString()
    imagenUrl?: string;
}
