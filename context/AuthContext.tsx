'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  AuthResponse, 
  getCurrentUser, 
  logout as apiLogout,
  refreshToken as apiRefreshToken
} from '@/lib/api/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (tokens: AuthResponse) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<boolean>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthState>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
  refreshTokens: async () => false,
  updateUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Инициализация при загрузке приложения
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedAccessToken = localStorage.getItem('access_token');
        
        if (storedAccessToken) {
          try {
            // Получаем свежие данные пользователя при инициализации
            const userData = await getCurrentUser();
            localStorage.setItem('user_data', JSON.stringify(userData));
            setUser(userData);
          } catch (error) {
            // Если токен истёк — пытаемся рефрешнуть
            console.log('Token expired, attempting refresh...');
            const storedRefreshToken = localStorage.getItem('refresh_token');
            if (storedRefreshToken) {
              try {
                const newTokens = await apiRefreshToken();
                await handleLoginSuccess(newTokens);
              } catch (refreshError) {
                console.log('Token refresh failed, clearing tokens');
                clearAuthData();
              }
            } else {
              clearAuthData();
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const clearAuthData = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  const handleLoginSuccess = useCallback(async (tokens: AuthResponse) => {
    try {
      // Сохраняем токены в localStorage
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
      
      // Получаем свежие данные пользователя после входа
      const userData = await getCurrentUser();
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Failed to get user after login:', error);
      clearAuthData();
      throw error;
    }
  }, []);

  const login = useCallback(async (tokens: AuthResponse) => {
    setIsLoading(true);
    try {
      clearAuthData();
      await handleLoginSuccess(tokens);
      router.push('/projects');
    } finally {
      setIsLoading(false);
    }
  }, [handleLoginSuccess, router]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      clearAuthData();
      router.push('/login');
    }
  }, [router]);

  const refreshTokens = useCallback(async (): Promise<boolean> => {
    try {
      const newTokens = await apiRefreshToken();
      
      // Сохраняем новые токены
      localStorage.setItem('access_token', newTokens.access_token);
      localStorage.setItem('refresh_token', newTokens.refresh_token);
      
      // Обновляем данные пользователя
      const userData = await getCurrentUser();
      localStorage.setItem('user_data', JSON.stringify(userData));
      setUser(userData);
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuthData();
      return false;
    }
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
    }
  }, [user]);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshTokens,
    updateUser,
  };

  // Обработчик ошибки 401 Unauthorized
  useEffect(() => {
    const handleUnauthorized = async () => {
      console.log('Unauthorized error detected, attempting to refresh tokens...');
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          const success = await refreshTokens();
          if (success) {
            console.log('Tokens refreshed successfully');
            return;
          }
        } catch (error) {
          console.error('Token refresh failed during unauthorized handling:', error);
        }
      }
      
      console.log('Token refresh failed or no refresh token, redirecting to login...');
      clearAuthData();
      setTimeout(() => {
        window.location.href = '/login';
      }, 300);
    };

    // Глобальный обработчик ошибок fetch
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (response.status === 401) {
          handleUnauthorized();
        }
        
        return response;
      } catch (error) {
        console.error('Fetch error:', error);
        throw error;
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [refreshTokens]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);