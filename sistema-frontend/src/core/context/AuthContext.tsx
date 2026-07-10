import { createContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import apiClient from '../api/axios.config';
import { loginService } from '../api/auth.api';

export interface UserPermission {
  module: string;
  actions: string[];
}

export interface UserSession {
  userId: string;
  email: string;
  role: string;
  permissions: UserPermission[];
}

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<any>;
  loginWithSocialToken: (provider: 'google' | 'facebook', token: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to decode JWT claims locally using jwt-decode library
const decodeJwt = (token: string): UserSession | null => {
  try {
    const payload = jwtDecode<{
      sub: string;
      email: string;
      role: string;
      permissions: UserPermission[];
    }>(token);

    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions || [],
    };
  } catch (error) {
    console.error('Failed to decode JWT token:', error);
    return null;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      const decoded = decodeJwt(token);
      if (decoded) {
        setUser(decoded);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('access_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await loginService(email, password);
      const { access_token } = response;
      
      localStorage.setItem('access_token', access_token);
      const decoded = decodeJwt(access_token);
      if (decoded) {
        setUser(decoded);
        setIsAuthenticated(true);
      } else {
        throw new Error('Token inválido devuelto por el servidor');
      }
      return response;
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Error en la autenticación');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithSocialToken = async (provider: 'google' | 'facebook', token: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post(`/auth/${provider}`, { token });
      const { access_token } = response.data;
      
      localStorage.setItem('access_token', access_token);
      const decoded = decodeJwt(access_token);
      if (decoded) {
        setUser(decoded);
        setIsAuthenticated(true);
      } else {
        throw new Error('Token inválido devuelto por el servidor');
      }
    } catch (err: any) {
      console.error('Auth request failed:', err);
      setError(err.message || 'Error en la autenticación social');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, error, login, loginWithSocialToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
