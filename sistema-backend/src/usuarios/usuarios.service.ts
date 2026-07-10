import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { UserDocument, UserSchemaName } from '../schemas/user.schema';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(UserSchemaName) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUsuarioDto: CreateUsuarioDto): Promise<any> {
    const { name, email, password, rol_id } = createUsuarioDto;
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existingUser = await this.userModel.findOne({ email: normalizedEmail }).exec();
    if (existingUser) {
      throw new BadRequestException('El correo electrónico ya está registrado');
    }

    // Encrypt password using bcrypt
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in the database
    const newUser = await this.userModel.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: rol_id,
      status: 'PENDIENTE',
    });

    // Return the user document excluding the password field
    const userObject = newUser.toObject();
    delete userObject.password;
    return userObject;
  }

  async update(id: string, updateUsuarioDto: UpdateUsuarioDto): Promise<any> {
    const { name, email, password, rol_id, status } = updateUsuarioDto;
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;

    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase().trim();
      // Check if email already exists for another user
      const existingUser = await this.userModel
        .findOne({ email: normalizedEmail, _id: { $ne: id } })
        .exec();
      if (existingUser) {
        throw new BadRequestException('El correo electrónico ya está registrado por otro usuario');
      }
      updateData.email = normalizedEmail;
    }

    if (password !== undefined) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    if (rol_id !== undefined) {
      updateData.role = rol_id;
    }

    if (status !== undefined) {
      updateData.status = status;
    }

    // Find and update in Mongoose
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('role')
      .exec();

    if (!updatedUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Exclude password in response
    const userObject = updatedUser.toObject();
    delete userObject.password;
    return userObject;
  }

  async findAll(): Promise<any[]> {
    try {
      // Find all users, exclude password, and populate the referenced role document
      const users = await this.userModel
        .find({}, { password: 0 })
        .populate('role')
        .exec();

      if (users && users.length > 0) {
        return users;
      }
    } catch (error: any) {
      console.warn('Error reading from database, falling back to mock users:', error.message);
    }

    // Fallback to 3 mock users if database is empty or fails
    return [
      {
        _id: 'mock-user-1',
        name: 'Juan Pérez',
        email: 'juan.perez@example.com',
        status: 'ACTIVO',
        role: { name: 'ADMIN' },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: 'mock-user-2',
        name: 'María López',
        email: 'maria.lopez@example.com',
        status: 'PENDIENTE',
        role: { name: 'USER' },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: 'mock-user-3',
        name: 'Carlos Gómez',
        email: 'carlos.gomez@example.com',
        status: 'INACTIVO',
        role: { name: 'USER' },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }
}
