// components/auth/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectPath?: string;
  requireAuth?: boolean; // true если нужна аутентификация, false если нужна аутентификация (для страниц входа/регистрации)
}

export default function ProtectedRoute({ 
  children, 
  redirectPath = '/login', 
  requireAuth = true 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push(redirectPath);
      } else if (!requireAuth && isAuthenticated) {
        router.push('/projects');
      }
    }
  }, [isAuthenticated, isLoading, router, redirectPath, requireAuth]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-[#000150]">Загрузка...</div>
      </div>
    );
  }

  return <>{children}</>;
}