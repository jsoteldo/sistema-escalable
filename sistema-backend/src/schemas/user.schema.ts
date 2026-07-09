import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @Prop({ select: false })
  password?: string; // Optional for users logging in via OAuth

  @Prop({ type: String, enum: ['PENDIENTE', 'ACTIVO', 'INACTIVO'], default: 'PENDIENTE' })
  status: string;

  @Prop({ type: Types.ObjectId, ref: 'Role', required: true })
  role: Types.ObjectId;

  // Social Auths
  @Prop({ type: String })
  googleId?: string;

  @Prop({ type: String })
  facebookId?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
export const UserSchemaName = 'User';
