'use client'

import { useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function RegistrationDetailsPage() {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [patronymic, setPatronymic] = useState('');
    const [avatar, setAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateForm = () => {
        if (!name.trim()) {
            setError('Please, enter your name');
            return false;
        }

        if (!surname.trim()) {
            setError('Please, enter your surname');
            return false;
        }

        setError('');
        return true;
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please, upload your image');
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                setError('image could not bigger than 2MB');
                return;
            }

            setAvatar(file);

            // Preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);

            setError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        {/* RESPONSE BLOCK */}
        try {
            console.log('Ending register:', {
                name,
                surname,
                patronymic: patronymic || 'Nothing',
                hasAvatar: !!avatar
            });

            await new Promise(resolve => setTimeout(resolve, 2000));

            {/* RESPONSE */}

            const firstStepData = localStorage.getItem('registration-step1');
            if (firstStepData) {
                const { email, password } = JSON.parse(firstStepData);
                localStorage.setItem('registration-step2', JSON.stringify({
                    email,
                    password,
                    name,
                    surname,
                    patronymic,
                    avatar: avatarPreview
                }));
            }

            router.push('/login');

        } catch (err) {
            setError('Failed to save data');
            console.error('Registration details error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const file = e.dataTransfer.files?.[0];
        if (file) {
            const inpitEvent = {
                target: { files: [file] }
            } as unknown as React.ChangeEvent<HTMLInputElement>;
            handleAvatarChange(inpitEvent);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/register-background.jpg)' }}>
            <div className="w-[560px] min-w-[180px] mx-auto p-6 bg-white rounded-[24px] shadow-lg">
                <h1 className="text-3xl text-[#000150] font-bold mb-1">Регистрация</h1>
                <p className="mb-6 text-[16px] text-gray-600">Введите данные, чтобы войти в личный кабинет</p>

                {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
                    {error}
                </div>
                )}

                <form onSubmit={handleSubmit} className="mb-[18px]">
                    <div className="mb-5">
                        {/*
                        <label htmlFor="name" className="block mb-2 text-[18px] font-semibold text-[#000150]">
                            Имя
                        </label>
                        */}
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
                        {/*
                        <label htmlFor="surname" className="block mb-2 text-[18px] font-semibold text-[#000150]">
                            Фамилия
                        </label>
                        */}
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
                        {/*
                        <label htmlFor="patronymic" className="block mb-2 text-[18px] font-semibold text-[#000150]">
                            Отчество (при наличии)
                        </label>
                        */}
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
                                placeholder="Введите отчество"
                            />
                        </div>
                    </div>

                    <div className="">
                        <label htmlFor="avatar" className="block mb-3 text-[16px] font-light text-[#000150] text-center">
                            Загрузите ваш аватар
                        </label>
                        <div 
                            className="flex flex-col items-center justify-center w-[124px] h-[124px] border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:border-[#000150] transition-colors mx-auto"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={triggerFileInput}
                        >
                            <input
                                type="file"
                                id="avatar"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                            
                            {avatarPreview ? (
                                <div className="relative w-26 h-26 rounded-full overflow-hidden">
                                    <Image 
                                        src={avatarPreview} 
                                        alt="Аватар" 
                                        layout="fill"
                                        objectFit="cover"
                                    />
                                </div>
                            ) : (
                                <div className="text-center p-4">
                                    <p className="text-sm text-gray-500">
                                        Загрузить
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-center mt-[18px]">
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
                <a href="/login" className="text-[#000150] hover:underline hover:text-blue-700 transition-colors">
                    Войти
                </a>
                </p>
            </div>
        </div>
    );
}