import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { type ObjectId } from 'mongoose';

@Schema()
export class User {
    _id: ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    surname: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true, unique: true })
    username: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true })
    birthdate: Date;

    @Prop({ required: false })
    description: string;

    @Prop({ required: false })
    profilePicture: string;

    @Prop({ required: true, enum: ['usuario', 'administrador'], default: 'usuario' })
    role: string;

    //Adelanto para el sprint 4
    @Prop({ default: true })
    isActive: boolean; 

    @Prop({ default: Date.now })
    createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
