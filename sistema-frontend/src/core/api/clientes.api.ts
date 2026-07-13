import apiClient from './axios.config';

export interface Cliente {
  _id: string;
  nombre: string;
  documento: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  status: 'ACTIVO' | 'INACTIVO';
  createdAt?: string;
  updatedAt?: string;
}

export const getClientes = async (): Promise<Cliente[]> => {
  try {
    const response = await apiClient.get('/clientes');
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Error al obtener la lista de clientes';
    throw new Error(message);
  }
};

export const createCliente = async (data: Omit<Cliente, '_id' | 'status'>): Promise<Cliente> => {
  try {
    const response = await apiClient.post('/clientes', data);
    return response.data;
  } catch (error: any) {
    const responseData = error.response?.data;
    let message = responseData?.message || 'Error al crear el cliente';
    if (Array.isArray(message)) {
      message = message.join(', ');
    }
    throw new Error(message);
  }
};

export const updateCliente = async (id: string, data: Partial<Cliente>): Promise<Cliente> => {
  try {
    const response = await apiClient.patch(`/clientes/${id}`, data);
    return response.data;
  } catch (error: any) {
    const responseData = error.response?.data;
    let message = responseData?.message || 'Error al actualizar el cliente';
    if (Array.isArray(message)) {
      message = message.join(', ');
    }
    throw new Error(message);
  }
};

export const deleteCliente = async (id: string): Promise<Cliente> => {
  try {
    const response = await apiClient.delete(`/clientes/${id}`);
    return response.data;
  } catch (error: any) {
    const responseData = error.response?.data;
    let message = responseData?.message || 'Error al eliminar el cliente';
    if (Array.isArray(message)) {
      message = message.join(', ');
    }
    throw new Error(message);
  }
};
