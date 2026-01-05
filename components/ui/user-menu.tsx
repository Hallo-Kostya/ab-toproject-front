// components/ui/user-menu.tsx
'use client';

import Image from "next/image";
import { formatShortName } from "@/utils/formatName";

interface UserMenuProps {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    patronymic?: string;
    tgLink: string;
    email: string;
    avatar?: string;
  };
  onLogout?: () => Promise<void>;
}

export default function UserMenu({ user, onLogout }: UserMenuProps) {
    const displayName = formatShortName(user.firstName, user.lastName);
    const avatarUrl = user.avatar || "/default_user.png";

    const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onLogout) {
        await onLogout();
    }
    };

  return (
    <div className="flex gap-[6px] items-center min-w-[100px]">
      <div className="user-info py-[5px] flex flex-col">
        <p className="whitespace-nowrap text-[#000150] text-[13.5px] font-semibold">{displayName}</p>
        <button 
          onClick={handleLogout}
          className="logout-btn text-[#333333] text-[10.5px] text-right hover:text-red-500 transition-colors"
        >
          Выход
        </button>
      </div>
      <div className="min-w-[32px] w-[39px]">
        <Image
          src={avatarUrl}
          alt={`${displayName} avatar`}
          width={39}
          height={39}
          className="w-full h-auto rounded-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/default_user.png";
          }}
        />
      </div>
    </div>
  );
}