import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// sub-esquema para los comentarios
@Schema()
export class Comment {
    @Prop({ type: Types.ObjectId, default: () => new Types.ObjectId() })
    _id: Types.ObjectId; // ID único del comentario

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId; // Quién comentó

    @Prop({ required: true })
    message: string;

    @Prop({ default: Date.now })
    createdAt: Date;

    @Prop({ default: false })
    modified: boolean;
}
const CommentSchema = SchemaFactory.createForClass(Comment);

@Schema({ timestamps: true })
export class Publication extends Document {
    @Prop({ required: true })
    titulo: string;

    @Prop({ required: true })
    descripcion: string;

    @Prop()
    imagenUrl?: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    usuario: Types.ObjectId;

    @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
    likes: Types.ObjectId[];

    @Prop({ type: Number, default: 0 })
    likesCount: number;

    // Aquí guardamos los comentarios embebidos
    @Prop({ type: [CommentSchema], default: [] })
    comments: Comment[];

    @Prop({ type: Number, default: 0 })
    commentsCount: number;

    @Prop({ default: true })
    isActive: boolean;
    
    createdAt?: Date;
    updatedAt?: Date;
}

export const PublicationSchema = SchemaFactory.createForClass(Publication);