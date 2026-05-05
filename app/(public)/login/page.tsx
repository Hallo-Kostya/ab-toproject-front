'use client'
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { login as apiLogin } from "@/lib/api/auth";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login: authLogin, isAuthenticated } = useAuth();

  // проверка для редиректа авторизованных пользователей
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/projects');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const authResponse = await apiLogin({ email, password });
      await authLogin(authResponse);
      
    } catch (err: any) {
      setError(err.message || 'Неверный email или пароль');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" 
      style={{ backgroundImage: 'url(/register-background.jpg)' }}
    >
      <div className="w-140 min-w-45 mx-auto p-6 bg-white rounded-3xl shadow-lg">
        <h1 className="text-3xl text-[#000150] font-bold mb-2">Вход</h1>
        <p className="mb-6">Введите данные, чтобы войти в личный кабинет</p>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="mb-4.5">
          <div className="mb-6">
            <label htmlFor="email" className="block mb-2 text-[18px] font-semibold text-[#000150]">
              Почта
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Image src={"/mail.svg"} alt={"Почта"} width={27} height={27}/>
              </span>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-11.75 pr-4 py-3 rounded-2xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
                placeholder="Введите почту"
              />
            </div>
          </div>
          <div className="mb-0.5">
            <label htmlFor="password" className="block mb-2 text-[18px] font-semibold text-[#000150]">
              Пароль
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Image src={"/key.svg"} alt={"Пароль"} width={27} height={27}/>
              </span>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-11.75 pr-4 py-3 rounded-2xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
                placeholder="Введите пароль"
                minLength={8}
              />
            </div>
          </div>
          <a
            href="#"
            className="block text-[13px] text-blue-900 mt-2 hover:text-blue-700 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              alert('Функция восстановления пароля будет добавлена позже');
            }}
          >
            Забыли пароль?
          </a>
          <div className="flex justify-center mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="max-w-50.25 bg-[#000150] text-white font-bold text-xl py-[11.5px] px-[29.5px] rounded-2xl hover:bg-blue-900 transition-colors"
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
          </div>
        </form>
        <p className="text-center text-[16px] font-semibold">
          Нет аккаунта?{' '}
          <a href="/register" className="text-[#000150] hover:underline hover:text-blue-700 transition-colors">
            Зарегистрироваться
          </a>
        </p>
      </div>
    </div>
  );
}