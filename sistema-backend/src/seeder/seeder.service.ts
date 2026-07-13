import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { UserDocument, UserSchemaName } from '../schemas/user.schema';
import { Role, RoleDocument } from '../schemas/role.schema';
import { ProductoDocument, ProductoSchemaName } from '../schemas/producto.schema';

@Injectable()
export class SeederService implements OnModuleInit {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectModel(UserSchemaName) private readonly userModel: Model<UserDocument>,
    @InjectModel(Role.name) private readonly roleModel: Model<RoleDocument>,
    @InjectModel(ProductoSchemaName) private readonly productoModel: Model<ProductoDocument>,
  ) {}

  async onModuleInit() {
    this.logger.log('Iniciando Seeder de Base de Datos...');
    try {
      // 1. Seed or update ADMIN Role with updated permissions (English CRUD)
      this.logger.log('Sincronizando Rol ADMIN...');
      const adminRole = await this.roleModel.findOneAndUpdate(
        { name: 'ADMIN' },
        {
          name: 'ADMIN',
          description: 'Administrador del sistema con todos los accesos',
          permissions: [
            { module: 'Ventas', actions: ['create', 'read', 'update', 'delete'] },
            { module: 'Clientes', actions: ['create', 'read', 'update', 'delete'] },
            { module: 'Usuarios', actions: ['create', 'read', 'update', 'delete'] },
            { module: 'Productos', actions: ['create', 'read', 'update', 'delete'] },
          ],
        },
        { upsert: true, new: true },
      );
      this.logger.log('Rol ADMIN configurado y actualizado en la base de datos.');

      // 2. Seed Admin User if not exists
      const adminEmail = 'admin@correo.com';
      const adminExists = await this.userModel.findOne({ email: adminEmail });
      if (!adminExists) {
        this.logger.log(`Creando Usuario Administrador inicial (${adminEmail})...`);
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await this.userModel.create({
          name: 'Administrador Principal',
          email: adminEmail,
          password: hashedPassword,
          status: 'ACTIVO',
          role: adminRole._id,
        });
        this.logger.log('Usuario Administrador inicial creado con éxito.');
      } else {
        this.logger.log(`El usuario Administrador (${adminEmail}) ya existe.`);
      }

      // 3. Seed test Products if empty
      const productsCount = await this.productoModel.countDocuments();
      if (productsCount === 0) {
        this.logger.log('Colección de Productos vacía. Sembrando productos de prueba...');
        await this.productoModel.create([
          {
            nombre: 'Arroz Integral Fino 1kg',
            codigoBarras: '7791234567890',
            descripcion: 'Paquete de arroz integral de grano largo fino',
            categoria: 'ALIMENTOS',
            precio: 1800,
            stock: 50,
            status: 'ACTIVO',
          },
          {
            nombre: 'Sartén Antiadherente 24cm',
            codigoBarras: '7799876543210',
            descripcion: 'Sartén de aluminio con revestimiento de teflón',
            categoria: 'UTENSILIOS',
            precio: 12500,
            stock: 15,
            status: 'ACTIVO',
          },
          {
            nombre: 'Aceite de Girasol 1.5L',
            codigoBarras: '7794567890123',
            descripcion: 'Aceite de girasol ideal para cocinar',
            categoria: 'ALIMENTOS',
            precio: 3200,
            stock: 30,
            status: 'ACTIVO',
          },
        ]);
        this.logger.log('Productos de prueba sembrados correctamente.');
      } else {
        this.logger.log('La colección de Productos ya contiene registros.');
      }

      this.logger.log('Seeder completado.');
    } catch (error: any) {
      this.logger.error('Error durante la ejecución del Seeder:', error.stack);
    }
  }
}
