import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PermissionsGuard } from '../auth/guards/permissions-guard';
import { RequirePermission } from '../auth/decorators/require-permission.decorator';
import { ClientesService } from './clientes.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Controller('clientes')
@UseGuards(AuthGuard('jwt'), PermissionsGuard)
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  @RequirePermission('Clientes', 'create')
  async create(@Body() createClienteDto: CreateClienteDto) {
    return this.clientesService.create(createClienteDto);
  }

  @Get()
  @RequirePermission('Clientes', 'read')
  async findAll() {
    return this.clientesService.findAll();
  }

  @Get(':id')
  @RequirePermission('Clientes', 'read')
  async findOne(@Param('id') id: string) {
    return this.clientesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermission('Clientes', 'update')
  async update(@Param('id') id: string, @Body() updateClienteDto: UpdateClienteDto) {
    return this.clientesService.update(id, updateClienteDto);
  }

  @Delete(':id')
  @RequirePermission('Clientes', 'delete')
  async remove(@Param('id') id: string) {
    return this.clientesService.remove(id);
  }
}
