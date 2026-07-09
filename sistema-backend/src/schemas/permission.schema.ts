import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PermissionDocument = Permission & Document;

@Schema({ _id: false })
export class Permission {
  @Prop({ required: true })
  module: string; // e.g., 'Usuarios', 'Roles', 'Ventas'

  @Prop({ type: [String], required: true, default: [] })
  actions: string[]; // e.g., ['create', 'read', 'update', 'delete']
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
