'use client';

import { useState, useRef } from 'react';
import Image from "next/image";
import { uploadAvatar } from "@/lib/api/auth";
import { useAuth } from "@/context/AuthContext";
import Modal from "@/components/ui/modal";

interface AvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AvatarModal({ isOpen, onClose }: AvatarModalProps) {
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { updateUser } = useAuth();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Пожалуйста, загрузите изображение');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setError('Изображение не должно быть больше 2MB');
        return;
      }
      setAvatar(file);
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
    if (!avatar) {
      setError('Пожалуйста, выберите изображение');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const updatedUser = await uploadAvatar(avatar);
      
      // обновляем данные пользователя в контексте
      updateUser({
        avatar_s3_path: updatedUser.avatar_s3_path
      });
      
      // чоищаем состояние
      setAvatar(null);
      setAvatarPreview(null);

      onClose();
      
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки аватара. Попробуйте еще раз.');
      console.error('Avatar upload error:', err);
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
      const inputEvent = {
        target: { files: [file] }
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleAvatarChange(inputEvent);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="px-30">
      <div className="p-6 bg-white rounded-3xl">
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Закрыть"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl text-[#000150] font-bold mb-2 text-center">Загрузить аватар</h2>
        <p className="mb-6 text-center text-gray-600">Выберите изображение для вашего профиля</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="avatar" className="block mb-3 text-[16px] font-light text-[#000150] text-center">
              Выберите изображение
            </label>
            <div
              className="flex flex-col items-center justify-center w-31 h-31 border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:border-[#000150] transition-colors mx-auto"
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
                <div className="relative w-32 h-32 rounded-full overflow-hidden">
                  <Image
                    src={avatarPreview}
                    alt="Предпросмотр аватара"
                    fill
                    className="object-cover"
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
            <p className="text-center text-xs text-gray-500 mt-2">
              Поддерживаются форматы: JPG, PNG, GIF. Максимальный размер: 2MB
            </p>
          </div>
          
          <div className="flex justify-center">
            <button
              type="submit"
              disabled={isLoading || !avatar}
              className="w-full max-w-50.25 bg-[#000150] text-white font-bold text-xl py-[11.5px] px-[29.5px] rounded-2xl hover:bg-blue-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Загрузка...' : 'Загрузить'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}