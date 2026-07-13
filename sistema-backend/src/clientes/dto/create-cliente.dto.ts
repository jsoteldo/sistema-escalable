import { IsNotEmpty, IsString, IsOptional, IsEmail, IsIn } from 'class-validator';

export class CreateClienteDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El documento es obligatorio' })
  documento: string;

  @IsEmail({}, { message: 'El formato de email no es válido' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsString()
  @IsOptional()
  @IsIn(['ACTIVO', 'INACTIVO'], { message: 'El estado debe ser ACTIVO o INACTIVO' })
  status?: string;
}
