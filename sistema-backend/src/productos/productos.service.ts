import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
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

  async importar(file: Express.Multer.File): Promise<any> {
    if (!file) {
      throw new BadRequestException('Archivo no provisto');
    }

    const content = file.buffer.toString('utf-8');
    const lines = content.split(/\r?\n/);
    if (lines.length < 2) {
      throw new BadRequestException('El archivo CSV está vacío o no contiene suficientes líneas');
    }

    // Cabecera: codigoBarras,nombre,categoria,precio,stock
    const header = lines[0].split(',').map(h => h.trim());
    const expectedHeader = ['codigoBarras', 'nombre', 'categoria', 'precio', 'stock'];
    const isHeaderValid = expectedHeader.every((val, index) => header[index] === val);
    if (!isHeaderValid) {
      throw new BadRequestException(
        'La estructura de la cabecera del CSV no es válida. Se espera: codigoBarras,nombre,categoria,precio,stock',
      );
    }

    const productsToInsert: any[] = [];
    const errors: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const fields = line.split(',').map(f => f.trim());
      if (fields.length < expectedHeader.length) {
        errors.push({
          line: i + 1,
          content: line,
          reason: 'Faltan campos obligatorios',
        });
        continue;
      }

      const [codigoBarras, nombre, categoria, precioStr, stockStr] = fields;
      const precio = Number(precioStr);
      const stock = Number(stockStr || 0);

      if (!codigoBarras || !nombre || !categoria || isNaN(precio) || precio <= 0 || isNaN(stock) || stock < 0) {
        errors.push({
          line: i + 1,
          content: line,
          reason: 'Datos inválidos o numéricos incorrectos',
        });
        continue;
      }

      if (!['ALIMENTOS', 'UTENSILIOS', 'OTROS'].includes(categoria)) {
        errors.push({
          line: i + 1,
          content: line,
          reason: `Categoría inválida: ${categoria}`,
        });
        continue;
      }

      productsToInsert.push({
        codigoBarras,
        nombre,
        categoria,
        precio,
        stock,
        status: 'ACTIVO',
      });
    }

    if (productsToInsert.length === 0) {
      return {
        successCount: 0,
        failCount: errors.length,
        errors,
      };
    }

    let successCount = 0;
    try {
      // insertMany with ordered: false lets MongoDB continue inserting on write errors (e.g. duplicate keys)
      const result = await this.productoModel.insertMany(productsToInsert, { ordered: false });
      successCount = result.length;
    } catch (error: any) {
      if (error.code === 11000 || (error.writeErrors && error.writeErrors.some((we: any) => we.code === 11000))) {
        throw new BadRequestException(
          'Importación parcial: Algunos códigos de barras ya existían en la base de datos y fueron omitidos.',
        );
      }
      throw new InternalServerErrorException(
        'Error interno del servidor durante la importación masiva de productos',
      );
    }

    return {
      successCount,
      failCount: errors.length,
      errors,
    };
  }

  async findAll(): Promise<Producto[]> {
    return this.productoModel.find().exec();
  }

  async remove(id: string): Promise<Producto> {
    const updated = await this.productoModel
      .findByIdAndUpdate(id, { status: 'INACTIVO' }, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('Producto no encontrado');
    }

    return updated;
  }
}
