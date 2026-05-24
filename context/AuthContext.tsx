'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  User, 
  AuthResponse, 
  getCurrentUser, 
  logout as apiLogout,
  refreshToken as apiRefreshToken,
  saveAuthTokens,
  clearAuthStorage,
  getStoredAccessExpiresAt,
  isTokenExpired,
  USE_COOKIES,
  getCachedUserData,
  cacheUserData,
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

const REFRESH_BUFFER_MS = 5 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const refreshPromiseRef = useRef<Promise<boolean> | null>(null);

  const handleLoginSuccess = useCallback(async (tokens: AuthResponse) => {
    try {
      // 1. Очищаем старое состояние
      if (!USE_COOKIES) {
        clearAuthStorage();
      }
      
      // 2. Сохраняем новые токены
      if (!USE_COOKIES) {
        saveAuthTokens(tokens);
      }
      
      // 3. Загружаем профиль пользователя
      const userData = await getCurrentUser();
      cacheUserData(userData);
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Failed to get user after login:', error);
      if (!USE_COOKIES) clearAuthStorage();
      throw error;
    }
  }, []);

  // Инициализация при загрузке
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (USE_COOKIES) {
          try {
            const userData = await getCurrentUser();
            cacheUserData(userData);
            setUser(userData);
          } catch {
            setUser(null);
          }
        } else {
          const expiresAt = getStoredAccessExpiresAt();
          const shouldRefresh = !expiresAt || Date.now() + REFRESH_BUFFER_MS >= expiresAt;
          
          if (shouldRefresh) {
            const refreshToken = localStorage.getItem('refresh_token')?.trim();
            if (refreshToken && !isTokenExpired(refreshToken, REFRESH_BUFFER_MS)) {
              try {
                const newTokens = await apiRefreshToken();
                await handleLoginSuccess(newTokens);
              } catch {
                clearAuthStorage();
              }
            } else {
              clearAuthStorage();
            }
          } else {
            try {
              const userData = await getCurrentUser();
              cacheUserData(userData);
              setUser(userData);
            } catch {
              const refreshToken = localStorage.getItem('refresh_token')?.trim();
              if (refreshToken) {
                try {
                  const newTokens = await apiRefreshToken();
                  await handleLoginSuccess(newTokens);
                } catch {
                  clearAuthStorage();
                }
              } else {
                clearAuthStorage();
              }
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (!USE_COOKIES) clearAuthStorage();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [handleLoginSuccess]);

  // Прокативный рефреш
  useEffect(() => {
    if (!user || USE_COOKIES) return;

    const checkAndRefresh = async () => {
      const expiresAt = getStoredAccessExpiresAt();
      if (expiresAt && Date.now() + REFRESH_BUFFER_MS >= expiresAt) {
        const refreshToken = localStorage.getItem('refresh_token')?.trim();
        if (refreshToken && !isTokenExpired(refreshToken)) {
          await refreshTokens();
        }
      }
    };

    const interval = setInterval(checkAndRefresh, 60_000);
    return () => clearInterval(interval);
  }, [user]);

  const login = useCallback(async (tokens: AuthResponse) => {
    setIsLoading(true);
    try {
      await handleLoginSuccess(tokens);
      router.push('/projects');
    } catch (err) {
      console.error('Login failed:', err);
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
      if (!USE_COOKIES) clearAuthStorage();
      setUser(null);
      router.push('/login');
    }
  }, [router]);

  const refreshTokens = useCallback(async (): Promise<boolean> => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    refreshPromiseRef.current = (async () => {
      try {
        const newTokens = await apiRefreshToken();
        
        if (!USE_COOKIES) {
          saveAuthTokens(newTokens);
        }
        
        const userData = await getCurrentUser();
        cacheUserData(userData);
        setUser(userData);
        return true;
      } catch (error) {
        console.error('Token refresh failed:', error);
        if (!USE_COOKIES) clearAuthStorage();
        return false;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    return refreshPromiseRef.current;
  }, []);

  const updateUser = useCallback((userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      cacheUserData(updatedUser);
    }
  }, [user]);

  // Глобальный интерцептор 401
  useEffect(() => {
    let isRefreshing = false;
    const failedQueue: Array<() => void> = [];

    const processQueue = (error: Error | null = null) => {
      failedQueue.forEach(cb => cb());
      failedQueue.length = 0;
    };

    const handleUnauthorized = async () => {
      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          failedQueue.push(() => {
            if (!USE_COOKIES) {
              const token = localStorage.getItem('access_token')?.trim();
              if (token && !isTokenExpired(token)) {
                resolve();
              } else {
                reject(new Error('Token refresh failed'));
              }
            } else {
              resolve();
            }
          });
        });
      }

      isRefreshing = true;
      try {
        if (USE_COOKIES) {
          const success = await refreshTokens();
          if (!success) throw new Error('Refresh failed');
          processQueue();
          return true;
        } else {
          const refreshToken = localStorage.getItem('refresh_token')?.trim();
          if (!refreshToken || isTokenExpired(refreshToken)) {
            throw new Error('No valid refresh token');
          }
          const success = await refreshTokens();
          if (!success) throw new Error('Refresh failed');
          processQueue();
          return true;
        }
      } catch (error) {
        console.error('Unauthorized handler failed:', error);
        if (!USE_COOKIES) clearAuthStorage();
        setUser(null);
        processQueue(new Error('Auth failed'));
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }, 100);
        return false;
      } finally {
        isRefreshing = false;
      }
    };

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const [resource, config] = args;
      const url = typeof resource === 'string' ? resource : resource instanceof URL ? resource.href : '';
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/refresh');
      
      if (isAuthEndpoint) {
        return originalFetch.apply(window, args);
      }

      try {
        const response = await originalFetch.apply(window, args);
        
        if (response.status === 401) {
          const refreshed = await handleUnauthorized();
          if (refreshed) {
            return originalFetch.apply(window, args);
          }
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

  // Редирект неавторизованных
  useEffect(() => {
    if (!isLoading && !user && pathname && !pathname.startsWith('/login') && !pathname.startsWith('/register')) {
      router.push('/login');
    }
  }, [isLoading, user, pathname, router]);

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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};