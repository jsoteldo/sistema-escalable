import apiClient from './axios.config';

export const getProductos = async () => {
  try {
    const response = await apiClient.get('/productos');
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Error al obtener los productos';
    throw new Error(message);
  }
};

export const createProducto = async (data: any) => {
  try {
    const response = await apiClient.post('/productos', data);
    return response.data;
  } catch (error: any) {
    const responseData = error.response?.data;
    let message = responseData?.message || 'Error al crear el producto';
    if (Array.isArray(message)) {
      message = message.join(', ');
    }
    throw new Error(message);
  }
};

export const updateProducto = async (id: string, data: any) => {
  try {
    const response = await apiClient.patch(`/productos/${id}`, data);
    return response.data;
  } catch (error: any) {
    const responseData = error.response?.data;
    let message = responseData?.message || 'Error al actualizar el producto';
    if (Array.isArray(message)) {
      message = message.join(', ');
    }
    throw new Error(message);
  }
};
