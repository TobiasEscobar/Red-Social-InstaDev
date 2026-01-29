import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Si expira, lanza 401 automaticamente
      secretOrKey: process.env.JWT_SECRET as string,
    });
  }

  async validate(payload: any) {
    // Busca al usuario en la BD para ver su estado real
    const user = await this.userService.findOne(payload.sub);

    // Si no existe o está deshabilitado, rechaza la petición
    if (!user || !user.isActive) {
        throw new UnauthorizedException('Usuario deshabilitado o inexistente');
    }

    // devuelve los datos para el Request
    return { userId: payload.sub, username: payload.username, email: payload.email, role: user.role };
  }
}