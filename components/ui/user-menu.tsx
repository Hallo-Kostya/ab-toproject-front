'use client';

import { useState, useRef } from "react";
import { formatShortName } from "@/utils/formatName";
import AvatarModal from "./avatarModal";

interface UserMenuProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    patronymic?: string | null;
    tgLink?: string | null;
    email: string;
    avatar?: string | null;
  };
  onLogout?: () => Promise<void>;
}

export default function UserMenu({ user, onLogout }: UserMenuProps) {
  const displayName = formatShortName(user.firstName, user.lastName);

  const avatarErrorRef = useRef(false);
  const [avatarKey, setAvatarKey] = useState(0);
  
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // ПостроениеURL для аватара
  const buildAvatarUrl = () => {
    if (!user.avatar || user.avatar.trim() === '') {
      return "/default_user.png";
    }
    
    // полный URL
    if (user.avatar.startsWith('http://') || user.avatar.startsWith('https://')) {
      return user.avatar;
    }
    
    // S3 URL
    const s3BaseUrl = process.env.NEXT_PUBLIC_S3_BASE_URL;
    if (s3BaseUrl) {
      const cleanPath = user.avatar.replace(/^\/+/, '');
      return `${s3BaseUrl}/${cleanPath}`;
    }
    
    // Прокси-эндпоинт бекенда
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9000/curators';
    const cleanPath = user.avatar.replace(/^\/+/, '');
    return `${apiBaseUrl}/${cleanPath}`;
  };

  const avatarUrl = buildAvatarUrl();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (onLogout) {
        await onLogout();
      }
    } catch (error) {
      console.error('Logout failed, clearing tokens locally:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAvatarModalOpen(true);
  };

  const handleImageError = () => {
    if (!avatarErrorRef.current) {
      avatarErrorRef.current = true;
      setAvatarKey(prev => prev + 1);
    }
  };

  // TODO: Fix
  const displayUrl = avatarErrorRef.current ? "/default_user.png" : avatarUrl;

  return (
    <>
      <div className="flex gap-1.5 items-center">
        <div className="user-info py-1.25 flex flex-col">
          <p className="whitespace-nowrap text-[#000150] text-[13.5px] font-semibold">{displayName}</p>
          <button 
            onClick={handleLogout}
            className="logout-btn text-[#333333] text-[10.5px] text-right hover:text-red-500 transition-colors"
          >
            Выход
          </button>
        </div>
        <div 
          className="min-w-9.75 w-9.75 h-9.75 cursor-pointer hover:opacity-80 transition-opacity shrink-0"
          onClick={handleAvatarClick}
          title="Изменить аватар"
        >
          <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white shadow-sm mt-0.5">
            <img
              key={avatarKey}
              src={displayUrl}
              alt={`${displayName} avatar`}
              className="object-cover w-full h-full"
              onError={handleImageError}
            />
          </div>
        </div>
      </div>

      <AvatarModal 
        isOpen={isAvatarModalOpen} 
        onClose={() => setIsAvatarModalOpen(false)} 
      />
    </>
  );
}