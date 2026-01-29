import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.services';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async create(createUserDto: CreateUserDto, file: Express.Multer.File | null) {
    try {
      // 1. Extraer contraseña y datos (variable 'password' original)
      const { password, ...userData } = createUserDto;
      
      // 2. Encriptar
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // 3. Subir imagen a Cloudinary (si existe el archivo)
      let profilePictureUrl = null;
      if (file) {
        const uploadResult = await this.cloudinaryService.uploadFile(file);
        profilePictureUrl = uploadResult.url;
      }

      // 4. Crear instancia del usuario
      const newUser = new this.userModel({
        ...userData,
        password: hashedPassword, // Guardamos la encriptada
        profilePicture: profilePictureUrl,
      });

      // 5. Guardar en Base de Datos
      const savedUser = await newUser.save();
      
      // 6. Retornar sin password
      const { password: excludedPassword, ...result } = savedUser.toObject();

      return result;

    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('El usuario o el correo electrónico ya existen.');
      }
      throw error;
    }
  }

  // Método para el AuthModule (Login)
  async findOneByIdentifier(identifier: string) {
    return this.userModel.findOne({
      $or: [
        { email: identifier },
        { username: identifier }
      ]
    }).exec();
  }

  // Método para buscar por ID (Refresh Token)
  async findOneById(id: string) {
    return this.userModel.findById(id).exec();
  }

  async findAll() {
    return this.userModel.find().exec();
  }

  async findOne(id: string) {
    return this.userModel.findById(id).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Si actualizan password, tambien encriptar
    if (updateUserDto.password) {
        const salt = await bcrypt.genSalt(10);
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }
    return this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
  }

  async remove(id: string) {
    // En lugar de findByIdAndDelete, cambia el valor de isActive a false
    return this.userModel.findByIdAndUpdate(id, { isActive: false }, { new: true }).exec();
  }

  async restore(id: string) {
    return this.userModel.findByIdAndUpdate(id, { isActive: true }, { new: true }).exec();
  }
}