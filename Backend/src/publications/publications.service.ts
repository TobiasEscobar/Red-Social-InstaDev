import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, SortOrder } from 'mongoose';
import { Publication } from './entities/publication.entity';
import { CreatePublicationDto } from './dto/create-publication.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.services';

@Injectable()
export class PublicationsService {
  constructor(
    @InjectModel(Publication.name)
    private publicacionModel: Model<Publication>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async crear(dto: CreatePublicationDto, usuarioId: string, file?: Express.Multer.File) {
    let imageUrl = null;
    if (file) {
      try {
        const uploadResult = await this.cloudinaryService.uploadFile(file, 'red-social/publicaciones');
        imageUrl = uploadResult.secure_url;
      } catch (error) {
        console.error('Error Cloudinary:', error);
      }
    }

    const nueva = new this.publicacionModel({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      imagenUrl: imageUrl,
      usuario: new Types.ObjectId(usuarioId),
    });

    const guardada = await nueva.save();
    return guardada.populate('usuario', 'username profilePicture');
  }

  async listar(query: any) {
    const { sortBy = 'date', offset = 0, limit = 10, userId } = query;
    const filtro: any = { isActive: true };
    
    if (userId) filtro.usuario = new Types.ObjectId(userId);

    let orden: Record<string, SortOrder> = sortBy === 'likes' ? { likesCount: -1 } : { createdAt: -1 };

    const publicaciones = await this.publicacionModel
      .find(filtro)
      .sort(orden)
      .skip(Number(offset))
      .limit(Number(limit))
      .populate('usuario', 'username profilePicture')
      .exec();

    const total = await this.publicacionModel.countDocuments(filtro);
    const data = publicaciones.map(pub => this.mapToDto(pub));

    return { data, total, page: Math.floor(Number(offset) / Number(limit)) + 1, limit: Number(limit) };
  }

  async obtenerPorId(id: string) {
    const pub = await this.publicacionModel.findById(id).populate('usuario', 'username profilePicture').exec();
    if (!pub || !pub.isActive) throw new NotFoundException('Publicación no encontrada');
    return this.mapToDto(pub);
  }

  async eliminar(id: string, userId: string, isAdmin: boolean) {
    const pub = await this.publicacionModel.findById(id);
    if (!pub) throw new NotFoundException('No encontrada');
    
    if (pub.usuario.toString() !== userId && !isAdmin) {
      throw new ForbiddenException('Sin permisos');
    }
    pub.isActive = false;
    await pub.save();
    return { message: 'Eliminada' };
  }

  async darLike(id: string, userId: string) {
    const pub = await this.publicacionModel.findById(id);
    if (!pub) throw new NotFoundException('No encontrada');

    if (pub.likes.some(l => l.toString() === userId)) throw new BadRequestException('Ya diste like');

    pub.likes.push(new Types.ObjectId(userId));
    pub.likesCount = pub.likes.length;
    await pub.save();
    
    // Devuelve el DTO actualizado para que el front se actualice
    const poblada = await pub.populate('usuario', 'username profilePicture');
    return this.mapToDto(poblada);
  }

  async quitarLike(id: string, userId: string) {
    const pub = await this.publicacionModel.findById(id);
    if (!pub) throw new NotFoundException('No encontrada');

    pub.likes = pub.likes.filter(l => l.toString() !== userId);
    pub.likesCount = pub.likes.length;
    await pub.save();

    const poblada = await pub.populate('usuario', 'username profilePicture');
    return this.mapToDto(poblada);
  }

  // --- COMENTARIOS ---

  async addComment(publicationId: string, userId: string, message: string) {
    const pub = await this.publicacionModel.findById(publicationId);
    if (!pub || !pub.isActive) throw new NotFoundException('Publicación no encontrada');

    const newComment = {
      _id: new Types.ObjectId(),
      userId: new Types.ObjectId(userId),
      message,
      createdAt: new Date(),
      modified: false
    };

    // $push directo para eficiencia 
    await this.publicacionModel.updateOne(
      { _id: pub._id },
      { 
        $push: { comments: newComment },
        $inc: { commentsCount: 1 }
      }
    );

    return { message: 'Comentario agregado', comment: newComment };
  }

  async getComments(publicationId: string, offset: number, limit: number) {
    const pId = new Types.ObjectId(publicationId);

    const result = await this.publicacionModel.aggregate([
      { $match: { _id: pId } },
      { $unwind: '$comments' }, // Descompone el array
      { $sort: { 'comments.createdAt': -1 } }, // Ordenar por los mas nuevos primero
      { $skip: Number(offset) }, // Saltea los ya obtenidos
      { $limit: Number(limit) }, // Limita la cantidad devuelta
      {
        // Traer datos del usuario que comentó
        $lookup: {
          from: 'users',
          localField: 'comments.userId',
          foreignField: '_id',
          as: 'userDocs'
        }
      },
      {
        // Formatear la salida limpia
        $project: {
          _id: '$comments._id',
          message: '$comments.message',
          createdAt: '$comments.createdAt',
          modified: '$comments.modified',
          userId: '$comments.userId', // Para verificar propiedad en el front
          user: {
            _id: { $arrayElemAt: ['$userDocs._id', 0] },
            username: { $arrayElemAt: ['$userDocs.username', 0] },
            profilePicture: { $arrayElemAt: ['$userDocs.profilePicture', 0] }
          }
        }
      }
    ]);

    return result;
  }

  async deleteComment(publicationId: string, commentId: string, userId: string, isAdmin: boolean) {
    const pub = await this.publicacionModel.findById(publicationId);
    if (!pub) throw new NotFoundException('Publicación no encontrada');

    // Buscar el comentario para verificar permisos
    const comment = pub.comments.find(c => c._id.toString() === commentId);
    if (!comment) throw new NotFoundException('Comentario no encontrado');

    if (comment.userId.toString() !== userId && !isAdmin) {
      throw new ForbiddenException('No tienes permiso para borrar este comentario');
    }

    // Eliminar usando $pull
    await this.publicacionModel.updateOne(
      { _id: pub._id },
      { 
        $pull: { comments: { _id: comment._id } },
        $inc: { commentsCount: -1 }
      }
    );

    return { message: 'Comentario eliminado' };
  }

  async updateComment(publicationId: string, commentId: string, userId: string, message: string) {
    const pub = await this.publicacionModel.findById(publicationId);
    if (!pub) throw new NotFoundException('Publicación no encontrada');

    const comment = pub.comments.find(c => c._id.toString() === commentId);
    if (!comment) throw new NotFoundException('Comentario no encontrado');

    if (comment.userId.toString() !== userId) {
      throw new ForbiddenException('No puedes editar este comentario');
    }

    // modificar el array en memoria y guardar
    comment.message = message;
    comment.modified = true;
    
    await pub.save();
    return { message: 'Comentario actualizado' };
  }

  // Asegura que siempre se devuelva el mismo formato al front
  private mapToDto(pub: any) {
    return {
      _id: pub._id,
      title: pub.titulo,
      message: pub.descripcion,
      imageUrl: pub.imagenUrl,
      author: {
        _id: pub.usuario ? (pub.usuario._id || pub.usuario) : 'desconocido',
        username: pub.usuario ? (pub.usuario.username || 'Usuario') : 'Usuario Desconocido',
        profileImage: pub.usuario ? pub.usuario.profilePicture : null
      },
      likes: (pub.likes || []).map(l => l.toString()),
      createdAt: pub.createdAt,
      commentsCount: pub.commentsCount || 0
    };
  }

  // Calcula estadísticas generales de publicaciones
  async getStatistics(from: Date, to: Date) {
    // 1. Publicaciones realizadas por usuario en el lapso
    const postsByUser = await this.publicacionModel.aggregate([
      { 
        $match: { createdAt: { $gte: from, $lte: to } } // Filtramos por fecha de creación del POST
      },
      { $group: { _id: '$usuario', count: { $sum: 1 } } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $project: { username: '$user.username', count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // 2. Comentarios por publicación en el lapso
    // Tiene en cuenta los comentarios hechos en esa fecha, sin importar cuando se creo el post
    const commentsByPost = await this.publicacionModel.aggregate([
      { $unwind: '$comments' }, 
      { 
        $match: { 
          'comments.createdAt': { $gte: from, $lte: to } // Filtrar comentarios por fecha
        } 
      },
      { 
        $group: { // Agrupa por publicacion
          _id: '$_id', 
          titulo: { $first: '$titulo' }, 
          commentCount: { $sum: 1 }
        } 
      },
      { $sort: { commentCount: -1 } },
      { $limit: 5 }
    ]);

    // 3. Comentarios en el tiempo (Grafico de linea)
    const commentsOverTime = await this.publicacionModel.aggregate([
      { $unwind: '$comments' },
      { 
        $match: { 
          'comments.createdAt': { $gte: from, $lte: to } 
        } 
      },
      {
        $group: {
          _id: { 
            month: { $month: '$comments.createdAt' }, 
            year: { $year: '$comments.createdAt' },
            dateStr: { $dateToString: { format: "%Y-%m", date: "$comments.createdAt" } }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.dateStr': 1 } }
    ]);

    return { postsByUser, commentsByPost, commentsOverTime };
  }

}