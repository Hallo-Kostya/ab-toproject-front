// components/auth/ProtectedRoute.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectUnauthenticatedTo?: string;
  redirectAuthenticatedTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true,
  redirectUnauthenticatedTo = '/login',
  redirectAuthenticatedTo = '/projects'
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, refreshTokens } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      if (isLoading) return;

      if (requireAuth && !isAuthenticated) {
        // Пытаемся обновить токены
        const refreshed = await refreshTokens();
        if (!refreshed) {
          router.push(redirectUnauthenticatedTo);
        }
      } else if (!requireAuth && isAuthenticated) {
        router.push(redirectAuthenticatedTo);
      }
    };

    checkAuth();
  }, [isAuthenticated, isLoading, requireAuth, router, refreshTokens]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-[#000150]">Загрузка...</div>
      </div>
    );
  }

  // Если требуется аутентификация и пользователь не авторизован - показываем загрузку до завершения проверки
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Если не требуется аутентификация и пользователь авторизован - показываем загрузку до редиректа
  if (!requireAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}