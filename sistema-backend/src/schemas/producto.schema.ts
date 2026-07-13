import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductoDocument = Producto & Document;

@Schema({ timestamps: true })
export class Producto {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true, unique: true, trim: true })
  codigoBarras: string;

  @Prop()
  descripcion?: string;

  @Prop({ type: String, enum: ['ALIMENTOS', 'UTENSILIOS', 'OTROS'], required: true })
  categoria: string;

  @Prop({ required: true })
  precio: number;

  @Prop({ default: 0 })
  stock: number;

  @Prop({ type: String, enum: ['ACTIVO', 'INACTIVO'], default: 'ACTIVO' })
  status: string;
}

export const ProductoSchema = SchemaFactory.createForClass(Producto);
export const ProductoSchemaName = 'Producto';
