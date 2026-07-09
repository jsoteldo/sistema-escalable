import React, { createContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../api/client';

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
  loginWithSocialToken: (provider: 'google' | 'facebook', token: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to decode JWT claims locally in frontend without extra libraries
const decodeJwt = (token: string): UserSession | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
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

  const loginWithSocialToken = async (provider: 'google' | 'facebook', token: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post(`/auth/${provider}`, { token });
      const { access_token } = response.data;
      
      localStorage.setItem('access_token', access_token);
      const decoded = decodeJwt(access_token);
      
      setUser(decoded);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Auth request failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, loginWithSocialToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
