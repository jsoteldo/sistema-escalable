import { IsEmail, IsOptional, IsString, MinLength, IsMongoId, IsIn } from 'class-validator';

export class UpdateUsuarioDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail({}, { message: 'El formato de email no es válido' })
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsOptional()
  password?: string;

  @IsMongoId({ message: 'El ID de rol debe ser un ObjectId de Mongo válido' })
  @IsOptional()
  rol_id?: string;

  @IsIn(['PENDIENTE', 'ACTIVO', 'INACTIVO'], { message: 'El estado no es válido' })
  @IsOptional()
  status?: string;
}
