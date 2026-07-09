import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Permission, PermissionSchema } from './permission.schema';

export type RoleDocument = Role & Document;

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true, uppercase: true })
  name: string; // e.g., 'ADMIN', 'USER', 'MANAGER'

  @Prop({ type: String })
  description: string;

  @Prop({ type: [PermissionSchema], default: [] })
  permissions: Permission[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);
