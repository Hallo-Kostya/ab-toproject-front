'use client';

import { Student, UpdateStudentData, updateStudent } from "@/lib/api/students";
import Modal from "../ui/modal";
import { useEffect, useState } from "react";

interface EditStudentProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string;
    initialData: Student;
    onEditSuccess?: () => void;
}

export default function EditStudentForm({ isOpen, onClose, studentId, initialData, onEditSuccess }: EditStudentProps) {
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [firstName, setFirstName] = useState(initialData.first_name);
    const [lastName, setLastName] = useState(initialData.last_name);
    const [patronymic, setPatronymic] = useState(initialData.patronymic ?? '');
    const [tgLink, setTgLink] = useState(initialData.tg_link ?? '');
    const [email, setEmail] = useState(initialData.email ?? '');

    useEffect(() => {
        setFirstName(initialData.first_name);
        setLastName(initialData.last_name);
        setPatronymic(initialData.patronymic ?? '');
        setTgLink(initialData.tg_link ?? '');
        setEmail(initialData.email ?? '');
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const studentData: UpdateStudentData = {
                first_name: firstName,
                last_name: lastName,
                patronymic: patronymic.trim() === '' ? null : patronymic.trim(),
                email: email.trim() === '' ? null : email.trim(),
                tg_link: tgLink.trim() === '' ? null : tgLink.trim(),
            };
            
            await updateStudent(studentId, studentData);

            onEditSuccess?.();
            onClose();
            
        } catch (err: any) {
            setError(err.message || 'Ошибка при редактировании студента');
            console.error('Student update error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6 bg-white rounded-3xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label="Закрыть"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                
                <h2 className="text-2xl text-[#000150] font-bold mb-4">Редактировать студента</h2>
                <p className="mb-6 text-gray-600">Измените требуемые поля</p>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="lastName" className="block mb-1 text-[16px] font-medium text-[#000150]">
                                Фамилия <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="lastName"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                                minLength={1}
                                maxLength={64}
                                className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
                                placeholder="Введите фамилию"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="firstName" className="block mb-1 text-[16px] font-medium text-[#000150]">
                                Имя <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                                minLength={1}
                                maxLength={64}
                                className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
                                placeholder="Введите имя"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="patronymic" className="block mb-1 text-[16px] font-medium text-[#000150]">Отчество</label>
                            <input
                                type="text"
                                id="patronymic"
                                value={patronymic}
                                onChange={(e) => setPatronymic(e.target.value)}
                                maxLength={64}
                                className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
                                placeholder="Введите отчество (необязательно)"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="email" className="block mb-1 text-[16px] font-medium text-[#000150]">
                                Почта <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
                                placeholder="email@example.com"
                            />
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="tgLink" className="block mb-1 text-[16px] font-medium text-[#000150]">Ссылка на Telegram</label>
                        <input
                            type="url"
                            id="tgLink"
                            value={tgLink}
                            onChange={(e) => setTgLink(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
                            placeholder="https://t.me/username (необязательно)"
                        />
                    </div>

                    <div className="flex gap-4 mt-10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-2xl font-medium hover:bg-gray-300 transition-colors"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 py-2 px-4 bg-[#000150] text-white rounded-2xl font-medium hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Сохранение...' : 'Сохранить'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}