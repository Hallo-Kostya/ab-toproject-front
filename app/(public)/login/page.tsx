'use client'

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    setIsLoading(true);

    {/* RESPONSE BLOCK */}
    try {
      console.log('Login:', {
        email,
        password: '[HIDDEN]'
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      {/* RESPONSE */}
        
      router.push('/projects');

    } catch (err) {
      setError('Incorrect email or password');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[560px] mx-auto p-6">
      <h1 className="text-3xl text-[#000150] font-bold mb-2">Вход</h1>
      <p className="mb-6">Введите данные, чтобы войти в личный кабинет</p>

      {error && (
        <div className="">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mb-[18px]">
        <div className="mb-6">
          <label htmlFor="email" className="block mb-2 text-[18px] font-semibold text-[#000150]">
            Почта
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Image src={"/mail.svg"} alt={"Пароль"} width={27} height={27}/>
            </span>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-[47px] pr-4 py-[14px] rounded-[16px] border-[2px] border-gray-300"
              placeholder="Введите почту"
            />
          </div>
        </div>

        <div className="mb-[16px]">
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
              className="w-full pl-[47px] pr-4 py-[14px] rounded-[16px] border-[2px] border-gray-300"
              placeholder="Введите пароль"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isLoading}
            className="max-w-[201px] bg-[#000150] text-white font-bold text-xl py-[11.5px] px-[29.5px] rounded-[16px] hover:bg-blue-900"
          >
            {isLoading ? 'Вход...' : 'Вход'}
          </button>
        </div>
      </form>

      <p className="text-center text-[16px] font-semibold">
        Нет аккаунта?{' '}
        <a href="/register" className="text-[#000150] hover:underline">
          Зарегистрироваться
        </a>
      </p>
    </div>
  );
}
