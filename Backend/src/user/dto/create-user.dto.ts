import { IsEmail, IsString, MinLength, Matches, IsDateString, IsOptional, MaxLength } from 'class-validator';

export class CreateUserDto {
    @IsString()
    @MinLength(2)
    @MaxLength(20, { message: 'El nombre no puede superar los 20 caracteres' })
    name: string;

    @IsString()
    @MinLength(2)
    @MaxLength(20, { message: 'El apellido no puede superar los 20 caracteres' })
    surname: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(3)
    username: string;

    @IsString()
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
        message: 'La contraseña debe contener al menos una mayúscula y un número',
    })
    password: string;

    @IsDateString()
    birthdate: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @IsOptional()
    @IsString()
    role?: string;
}
