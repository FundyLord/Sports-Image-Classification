import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authAPI } from '../api';
import type { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface JWTPayload {
  user_id: number;
  username: string;
  exp: number;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode<JWTPayload>(token);
        // Check if token is expired
        if (decoded.exp * 1000 > Date.now()) {
          setUser({ id: decoded.user_id, username: decoded.username });
        } else {
          // Token expired, clear it
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const data = await authAPI.login(username, password);
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    
    const decoded = jwtDecode<JWTPayload>(data.access);
    setUser({ id: decoded.user_id, username });
  };

  const register = async (username: string, password: string, email?: string) => {
    await authAPI.register(username, password, email);
    // Auto-login after registration
    await login(username, password);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
