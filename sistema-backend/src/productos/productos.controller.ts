import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Post('importar')
  @RequirePermission('Productos', 'create')
  @UseInterceptors(FileInterceptor('file'))
  async importar(@UploadedFile() file: Express.Multer.File) {
    return this.productosService.importar(file);
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

  @Delete(':id')
  @RequirePermission('Productos', 'delete')
  async remove(@Param('id') id: string) {
    return this.productosService.remove(id);
  }
}
