import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ClienteDocument = Cliente & Document;

@Schema({ timestamps: true })
export class Cliente {
  @Prop({ required: true, trim: true })
  nombre: string;

  @Prop({ required: true, unique: true, trim: true })
  documento: string;

  @Prop({ trim: true })
  email?: string;

  @Prop({ trim: true })
  telefono?: string;

  @Prop({ trim: true })
  direccion?: string;

  @Prop({ type: String, enum: ['ACTIVO', 'INACTIVO'], default: 'ACTIVO' })
  status: string;
}

export const ClienteSchema = SchemaFactory.createForClass(Cliente);
