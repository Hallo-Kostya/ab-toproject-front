'use client'
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api/auth";
import { useAuth } from "@/context/AuthContext";

export default function RegistrationDetailsPage() {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [patronymic, setPatronymic] = useState('');
    const [tgLink, setTgLink] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    useEffect(() => {
        const firstStepData = localStorage.getItem('registration-step1');
        if (!firstStepData) {
            router.push('/register');
        }
    }, [router]);

    const validateForm = () => {
        if (!name.trim()) {
            setError('Пожалуйста, введите ваше имя');
            return false;
        }
        if (!surname.trim()) {
            setError('Пожалуйста, введите вашу фамилию');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validateForm()) return;

      setIsLoading(true);
      setError('');

      try {
        const firstStepData = localStorage.getItem('registration-step1');
        if (!firstStepData) {
            throw new Error('Registration data not found. Please start over.');
        }

        const { email, password } = JSON.parse(firstStepData);

        const registerData = {
          email,
          password,
          first_name: name,
          last_name: surname,
          patronymic: patronymic || undefined,
          tg_link: tgLink || undefined
        };

        const authResponse = await register(registerData);
        console.log('Ответ от сервера:', authResponse);
        await login(authResponse);
        
        // очищаем данные регистрации
        localStorage.removeItem('registration-step1');

        router.push('/projects');
        
    } catch (err: any) {
        setError(err.message || 'Ошибка регистрации. Попробуйте еще раз.');
        console.error('Registration error:', err);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" 
      style={{ backgroundImage: 'url(/register-background.jpg)' }}
    >
      <div className="w-[560px] min-w-[180px] mx-auto p-6 bg-white rounded-[24px] shadow-lg">
        <h1 className="text-3xl text-[#000150] font-bold mb-1">Регистрация</h1>
        <p className="mb-6 text-[16px] text-gray-600">Введите данные, чтобы завершить регистрацию</p>
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="mb-[18px]">
          <div className="mb-5">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Image src="/user.svg" alt={"Enter user data icon"} width={27} height={27} />
              </span>
              <input
                type="text"
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-[47px] pr-4 py-[12px] rounded-[16px] border-[2px] border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
                placeholder="Введите имя"
              />
            </div>
          </div>
          <div className="mb-5">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Image src="/user.svg" alt={"Enter user data icon"} width={27} height={27} />
              </span>
              <input
                type="text"
                id="surname"
                name="surname"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                required
                className="w-full pl-[47px] pr-4 py-[12px] rounded-[16px] border-[2px] border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
                placeholder="Введите фамилию"
              />
            </div>
          </div>
          <div className="mb-5">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Image src="/user.svg" alt={"Enter user data icon"} width={27} height={27} />
              </span>
              <input
                type="text"
                id="patronymic"
                value={patronymic}
                onChange={(e) => setPatronymic(e.target.value)}
                className="w-full pl-[47px] pr-4 py-[12px] rounded-[16px] border-[2px] border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
                placeholder="Введите отчество (необязательно)"
              />
            </div>
          </div>
          <div className="mb-5">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Image src="/user.svg" alt={"Enter user data icon"} width={27} height={27} />
              </span>
              <input
                type="text"
                id="tgLink"
                name="tgLink"
                value={tgLink}
                onChange={(e) => setTgLink(e.target.value)}
                className="w-full pl-[47px] pr-4 py-[12px] rounded-[16px] border-[2px] border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
                placeholder="Ссылка на Telegram (необязательно)"
              />
            </div>
          </div>
          <div className="flex justify-center mt-[18px]">
            <button
              type="submit"
              disabled={isLoading}
              className="max-w-[201px] bg-[#000150] text-white font-bold text-xl py-[11.5px] px-[29.5px] rounded-[16px] hover:bg-blue-900 transition-colors"
            >
              {isLoading ? 'Регистрация...' : 'Регистрация'}
            </button>
          </div>
        </form>
        <p className="text-center text-[16px] font-semibold">
          У вас уже есть аккаунт?{' '}
          <a href="/login" className="text-[#000150] hover:underline hover:text-blue-700 transition-colors">
            Войти
          </a>
        </p>
      </div>
    </div>
  );
}