import apiClient from './axios.config';

export const loginService = async (email: string, password: string) => {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  } catch (error: any) {
    // Extract a friendly error message from the response if it exists
    const message = error.response?.data?.message || 'Error en la autenticación';
    throw new Error(message);
  }
};
