import { IsOptional, IsString, IsEnum, IsNumber, IsPositive, Min } from 'class-validator';

export class UpdateProductoDto {
  @IsString()
  @IsOptional()
  nombre?: string;

  @IsString()
  @IsOptional()
  codigoBarras?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsEnum(['ALIMENTOS', 'UTENSILIOS', 'OTROS'], { message: 'La categoría no es válida' })
  @IsOptional()
  categoria?: string;

  @IsNumber({}, { message: 'El precio debe ser un número' })
  @IsPositive({ message: 'El precio debe ser mayor a 0' })
  @IsOptional()
  precio?: number;

  @IsNumber({}, { message: 'El stock debe ser un número' })
  @Min(0, { message: 'El stock no puede ser menor a 0' })
  @IsOptional()
  stock?: number;

  @IsEnum(['ACTIVO', 'INACTIVO'], { message: 'El estado no es válido' })
  @IsOptional()
  status?: string;
}
