import apiClient from './axios.config';

export const getUsuarios = async () => {
  try {
    const response = await apiClient.get('/usuarios');
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Error al obtener la lista de usuarios';
    throw new Error(message);
  }
};

export const createUsuario = async (data: any) => {
  try {
    const response = await apiClient.post('/usuarios', data);
    return response.data;
  } catch (error: any) {
    const responseData = error.response?.data;
    let message = responseData?.message || 'Error al crear el usuario';
    if (Array.isArray(message)) {
      message = message.join(', ');
    }
    throw new Error(message);
  }
};

export const updateUsuario = async (id: string, data: any) => {
  try {
    const response = await apiClient.patch(`/usuarios/${id}`, data);
    return response.data;
  } catch (error: any) {
    const responseData = error.response?.data;
    let message = responseData?.message || 'Error al actualizar el usuario';
    if (Array.isArray(message)) {
      message = message.join(', ');
    }
    throw new Error(message);
  }
};
