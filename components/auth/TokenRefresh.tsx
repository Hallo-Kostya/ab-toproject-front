'use client';

import { useEffect, useRef } from 'react';
import { refreshToken } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';

export default function TokenRefresher() {
  const router = useRouter();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const refreshTokens = async () => {
      try {
        const refreshTokenValue = localStorage.getItem('refresh_token');
        
        if (refreshTokenValue) {
          // Выполняем рефреш токена
          const authResponse = await refreshToken(refreshTokenValue);
          
          // Сохраняем новые токены
          localStorage.setItem('access_token', authResponse.access_token);
          localStorage.setItem('refresh_token', authResponse.refresh_token);
          
          console.log('Tokens successfully refreshed at', new Date().toISOString());
        } else {
          console.log('No refresh token found, stopping refresh cycle');
          clearRefreshInterval();
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        
        // Если рефреш токена не удался, очищаем токены и перенаправляем на логин
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_data');
        
        console.log('Tokens cleared due to refresh failure');
        
        // Перенаправляем на страницу логина
        router.push('/login');
      }
    };

    const setupRefreshInterval = () => {
      // Очищаем предыдущий интервал, если он существует
      clearRefreshInterval();
      
      // Устанавливаем новый интервал на 15 минут (900000 мс)
      refreshIntervalRef.current = setInterval(refreshTokens, 15 * 60 * 1000);
      console.log('Token refresh interval set for 15 minutes');
      
      // Выполняем первый рефреш сразу при монтировании
      refreshTokens();
    };

    const clearRefreshInterval = () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
        console.log('Token refresh interval cleared');
      }
    };

    // Проверяем, есть ли refresh token при монтировании
    const refreshTokenValue = localStorage.getItem('refresh_token');
    if (refreshTokenValue) {
      setupRefreshInterval();
    }

    // Очищаем интервал при размонтировании компонента
    return () => {
      clearRefreshInterval();
    };
  }, [router]);

  return null; // Этот компонент не рендерит ничего видимого
}