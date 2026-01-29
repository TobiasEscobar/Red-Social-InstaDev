import { Controller, Post, Body, UseGuards, Request, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @UseInterceptors(FileInterceptor('profilePicture'))
  async register(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.authService.register(createUserDto, file);
  }

  @Post('login')
  async login(@Body() body: any) {
    const { username, email, identifier, password } = body;
    const userIdentifier = identifier || username || email;
    
    return this.authService.login(userIdentifier, password);
  }

  // Devuelve el usuario completo buscándolo en la base de datos
  @UseGuards(AuthGuard('jwt'))
  @Post('autorizar')
  async autorizar(@Request() req) {
    return this.authService.getUserProfile(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('refrescar')
  async refrescar(@Request() req) {
    return this.authService.refreshToken(req.user);
  }
}