'use client'

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const validatePassword = (password: string): boolean => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validatePassword(password)) {
      setError('Пароль должен содержать минимум 8 символов, буквы и цифры');
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setIsLoading(true);

    {/* RESPONSE BLOCK */}

    try {
      console.log('Registration:', {
        email,
        password: '[HIDDEN]'
      });

      await new Promise(resolve => setTimeout(resolve, 1500));

      {/* RESPONSE */}

      router.push('/login');

    } catch (err) {
      setError('Registration failed. Try again later.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-[560px] mx-auto p-6">
      <h1 className="text-3xl text-[#000150] font-bold mb-2">Регистрация</h1>
      <p className="mb-6">Введите данные для регистрации нового аккаунта</p>

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
              minLength={8}
            />
          </div>
        </div>

        <div className="mb-[18px]">
          <label htmlFor="confirmPassword" className="block mb-2 text-[18px] font-semibold text-[#000150]">
            Повторите пароль
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <Image src={"/key.svg"} alt={"Пароль"} width={27} height={27}/>
            </span>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full pl-[47px] pr-4 py-[14px] rounded-[16px] border-[2px] border-gray-300"
              placeholder="Повторите ваш пароль"
            />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isLoading}
            className="max-w-[201px] bg-[#000150] text-white font-bold text-xl py-[11.5px] px-[29.5px] rounded-[16px] hover:bg-blue-900"
          >
            {isLoading ? 'Регистрация...' : 'Регистрация'}
          </button>
        </div>
      </form>

      <p className="text-center text-[16px] font-semibold">
        У вас уже есть аккаунт?{' '}
        <a href="/login" className="text-[#000150] hover:underline">
          Войти
        </a>
      </p>
    </div>
  );
}