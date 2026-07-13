import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../auth/guards/permissions-guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { ProductosService } from './productos.service';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Controller('productos')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @RequirePermission('Productos', 'create')
  async create(@Body() createProductoDto: CreateProductoDto) {
    return this.productosService.create(createProductoDto);
  }

  @Patch(':id')
  @RequirePermission('Productos', 'update')
  async update(@Param('id') id: string, @Body() updateProductoDto: UpdateProductoDto) {
    return this.productosService.update(id, updateProductoDto);
  }

  @Get()
  @RequirePermission('Productos', 'read')
  async findAll() {
    return this.productosService.findAll();
  }
}
