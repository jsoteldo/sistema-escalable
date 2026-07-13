import { IsNotEmpty, IsString, IsOptional, IsEnum, IsNumber, IsPositive, Min } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  nombre: string;

  @IsString()
  @IsNotEmpty({ message: 'El código de barras es obligatorio' })
  codigoBarras: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsEnum(['ALIMENTOS', 'UTENSILIOS', 'OTROS'], { message: 'La categoría no es válida' })
  @IsNotEmpty({ message: 'La categoría es obligatoria' })
  categoria: string;

  @IsNumber({}, { message: 'El precio debe ser un número' })
  @IsPositive({ message: 'El precio debe ser mayor a 0' })
  @IsNotEmpty({ message: 'El precio es obligatorio' })
  precio: number;

  @IsNumber({}, { message: 'El stock debe ser un número' })
  @Min(0, { message: 'El stock no puede ser menor a 0' })
  @IsOptional()
  stock?: number;

  @IsEnum(['ACTIVO', 'INACTIVO'], { message: 'El estado no es válido' })
  @IsOptional()
  status?: string;
}
