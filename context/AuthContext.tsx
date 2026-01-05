// context/AuthContext.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ С ОБНОВЛЕНИЕМ ДАННЫХ

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
            // ВСЕГДА получаем свежие данные пользователя при инициализации
            const userData = await getCurrentUser(storedAccessToken);
            
            // Сохраняем обновленные данные
            localStorage.setItem('user_data', JSON.stringify(userData));
            setUser(userData);
          } catch (error) {
            console.log('Failed to get user data, attempting refresh...');
            const storedRefreshToken = localStorage.getItem('refresh_token');
            if (storedRefreshToken) {
              try {
                const newTokens = await apiRefreshToken(storedRefreshToken);
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

  const handleLoginSuccess = async (tokens: AuthResponse) => {
    try {
      // Сохраняем токены
      localStorage.setItem('access_token', tokens.access_token);
      localStorage.setItem('refresh_token', tokens.refresh_token);
      
      // ВСЕГДА получаем СВЕЖИЕ данные пользователя после входа
      const userData = await getCurrentUser(tokens.access_token);
      
      // Сохраняем обновленные данные
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Failed to get user after login:', error);
      clearAuthData();
      throw error;
    }
  };

  const login = useCallback(async (tokens: AuthResponse) => {
    setIsLoading(true);
    try {
      // Очищаем предыдущие данные перед новым входом
      clearAuthData();
      
      // Обрабатываем успешный вход с получением свежих данных
      await handleLoginSuccess(tokens);
      
      // Перенаправляем на главную страницу
      router.push('/projects');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await apiLogout(refreshToken);
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      clearAuthData();
      router.push('/login');
    }
  }, [router]);

  const refreshTokens = useCallback(async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return false;

      const newTokens = await apiRefreshToken(refreshToken);
      
      // Сохраняем новые токены
      localStorage.setItem('access_token', newTokens.access_token);
      localStorage.setItem('refresh_token', newTokens.refresh_token);
      
      // ВСЕГДА получаем СВЕЖИЕ данные пользователя после обновления токенов
      const userData = await getCurrentUser(newTokens.access_token);
      
      // Сохраняем обновленные данные
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);