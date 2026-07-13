import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Producto, ProductoDocument, ProductoSchemaName } from '../schemas/producto.schema';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductosService {
  constructor(
    @InjectModel(ProductoSchemaName) private readonly productoModel: Model<ProductoDocument>,
  ) {}

  async create(createProductoDto: CreateProductoDto): Promise<Producto> {
    const { codigoBarras } = createProductoDto;
    // Check barcode uniqueness
    const existing = await this.productoModel.findOne({ codigoBarras }).exec();
    if (existing) {
      throw new BadRequestException('El código de barras ya está registrado');
    }
    return this.productoModel.create(createProductoDto);
  }

  async update(id: string, updateProductoDto: UpdateProductoDto): Promise<Producto> {
    const { codigoBarras } = updateProductoDto;
    
    // Check barcode uniqueness for another product
    if (codigoBarras !== undefined) {
      const existing = await this.productoModel.findOne({ codigoBarras, _id: { $ne: id } }).exec();
      if (existing) {
        throw new BadRequestException('El código de barras ya está registrado por otro producto');
      }
    }

    const updated = await this.productoModel
      .findByIdAndUpdate(id, updateProductoDto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Producto no encontrado');
    }

    return updated;
  }

  async findAll(): Promise<Producto[]> {
    return this.productoModel.find().exec();
  }
}
