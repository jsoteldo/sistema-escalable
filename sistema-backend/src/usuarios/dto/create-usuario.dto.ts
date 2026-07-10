import { IsEmail, IsNotEmpty, IsString, MinLength, IsMongoId } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  name: string;

  @IsEmail({}, { message: 'El formato de email no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  password: string;

  @IsMongoId({ message: 'El ID de rol debe ser un ObjectId de Mongo válido' })
  @IsNotEmpty({ message: 'El ID de rol es obligatorio' })
  rol_id: string;
}
