import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  private generateToken(user: any) {
    const payload = { 
      username: user.username, 
      sub: user._id, 
      email: user.email,
      role: user.role || 'usuario' 
    };
    
    return {
      token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async validateUser(identifier: string, pass: string): Promise<any> {
    const user = await this.userService.findOneByIdentifier(identifier);
    if (user && (await bcrypt.compare(pass, user.password))) {
      if (!user.isActive) {
        throw new UnauthorizedException('Tu cuenta ha sido deshabilitada por un administrador.');
      }
      const { password, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async login(identifier: string, pass: string) {
    const user = await this.validateUser(identifier, pass);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    return this.generateToken(user);
  }

  async register(createUserDto: CreateUserDto, file: Express.Multer.File) {
    const user = await this.userService.create(createUserDto, file);
    return this.generateToken(user);
  }

  // Obtiene el perfil completo desde la BD para /autorizar
  async getUserProfile(userId: string) {
    const user = await this.userService.findOneById(userId);
    if (!user) throw new UnauthorizedException('Usuario no encontrado');
    
    // Devuelve el usuario sin la contraseña 
    const { password, ...result } = user.toObject();
    return result;
  }

  async refreshToken(user: any) {
    const fullUser = await this.userService.findOneById(user.userId);
    if (!fullUser) throw new UnauthorizedException('Usuario no encontrado');
    
    return this.generateToken(fullUser);
  }
}