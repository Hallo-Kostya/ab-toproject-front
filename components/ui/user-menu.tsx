'use client';

import Image from "next/image";
import { useState } from "react";
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
  const avatarUrl = user.avatar && user.avatar.trim() !== '' 
    ? user.avatar 
    : "/default_user.png";
  
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

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

  return (
    <>
      <div className="flex gap-[6px] items-center min-w-[100px] ml-auto">
        <div className="user-info py-[5px] flex flex-col">
          <p className="whitespace-nowrap text-[#000150] text-[13.5px] font-semibold">{displayName}</p>
          <button 
            onClick={handleLogout}
            className="logout-btn text-[#333333] text-[10.5px] text-right hover:text-red-500 transition-colors"
          >
            Выход
          </button>
        </div>
        <div 
          className="min-w-[39px] w-[39px] h-[39px] cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
          onClick={handleAvatarClick}
          title="Изменить аватар"
        >
          <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white shadow-sm">
            <Image
              src={avatarUrl}
              alt={`${displayName} avatar`}
              fill
              className="object-cover"
              priority
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/default_user.png";
              }}
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