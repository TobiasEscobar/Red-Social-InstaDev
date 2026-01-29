import {
  Controller,
  Put,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  Req,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { PublicationsService } from './publications.service';
import { CreatePublicationDto } from './dto/create-publication.dto';

@Controller('publications')
export class PublicationsController {
  constructor(private readonly publicationsService: PublicationsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt')) // Requiere Token
  @UseInterceptors(FileInterceptor('image'))
  async crear(
    @Body() dto: CreatePublicationDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    // Obtenemos ID seguro del token
    const userId = req.user.userId; 
    return this.publicationsService.crear(dto, userId, file);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async listar(@Query() query) {
    return this.publicationsService.listar(query);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async obtenerUna(@Param('id') id: string) {
    return this.publicationsService.obtenerPorId(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async eliminar(@Param('id') id: string, @Req() req) {
    const userId = req.user.userId;
    const isAdmin = req.user.role === 'administrador'; // Valida rol desde el token
    
    return this.publicationsService.eliminar(id, userId, isAdmin);
  }

  @Post(':id/like')
  @UseGuards(AuthGuard('jwt'))
  async darLike(@Param('id') id: string, @Req() req) {
    const userId = req.user.userId;
    return this.publicationsService.darLike(id, userId);
  }

  @Delete(':id/like')
  @UseGuards(AuthGuard('jwt'))
  async quitarLike(@Param('id') id: string, @Req() req) {
    const userId = req.user.userId;
    return this.publicationsService.quitarLike(id, userId);
  }

  // Comentarios
  @Get(':id/comments')
  @UseGuards(AuthGuard('jwt'))
  async getComments(
    @Param('id') id: string,
    @Query('offset') offset = 0,
    @Query('limit') limit = 5
  ) {
    return this.publicationsService.getComments(id, offset, limit);
  }

  @Post(':id/comments')
  @UseGuards(AuthGuard('jwt'))
  async addComment(
    @Param('id') id: string,
    @Body('message') message: string,
    @Req() req
  ) {
    return this.publicationsService.addComment(id, req.user.userId, message);
  }

  @Delete(':id/comments/:commentId')
  @UseGuards(AuthGuard('jwt'))
  async deleteComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Req() req
  ) {
    const isAdmin = req.user.role === 'administrador';
    return this.publicationsService.deleteComment(id, commentId, req.user.userId, isAdmin);
  }

  @Put(':id/comments/:commentId')
  @UseGuards(AuthGuard('jwt'))
  async updateComment(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @Body('message') message: string,
    @Req() req
  ) {
    return this.publicationsService.updateComment(id, commentId, req.user.userId, message);
  }

}