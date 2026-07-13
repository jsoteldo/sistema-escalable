import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cliente, ClienteDocument } from '../schemas/cliente.schema';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectModel(Cliente.name) private readonly clienteModel: Model<ClienteDocument>,
  ) {}

  async create(createClienteDto: CreateClienteDto): Promise<ClienteDocument> {
    const { documento } = createClienteDto;

    // Check unique document
    const existingCliente = await this.clienteModel.findOne({ documento }).exec();
    if (existingCliente) {
      throw new BadRequestException('El documento ya se encuentra registrado');
    }

    const newCliente = new this.clienteModel(createClienteDto);
    return newCliente.save();
  }

  async findAll(): Promise<ClienteDocument[]> {
    return this.clienteModel.find().exec();
  }

  async findOne(id: string): Promise<ClienteDocument> {
    const cliente = await this.clienteModel.findById(id).exec();
    if (!cliente) {
      throw new NotFoundException('Cliente no encontrado');
    }
    return cliente;
  }

  async update(id: string, updateClienteDto: UpdateClienteDto): Promise<ClienteDocument> {
    const { documento } = updateClienteDto;

    if (documento !== undefined) {
      const existingCliente = await this.clienteModel.findOne({ documento, _id: { $ne: id } }).exec();
      if (existingCliente) {
        throw new BadRequestException('El documento ya está registrado por otro cliente');
      }
    }

    const updatedCliente = await this.clienteModel
      .findByIdAndUpdate(id, updateClienteDto, { new: true })
      .exec();

    if (!updatedCliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return updatedCliente;
  }

  async remove(id: string): Promise<ClienteDocument> {
    const deletedCliente = await this.clienteModel
      .findByIdAndUpdate(id, { status: 'INACTIVO' }, { new: true })
      .exec();

    if (!deletedCliente) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return deletedCliente;
  }
}
