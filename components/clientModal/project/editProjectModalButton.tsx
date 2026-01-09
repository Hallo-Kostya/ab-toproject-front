'use client';

import { useState } from 'react';
import { useAuth } from "@/context/AuthContext";

export default function EditProjectModalButton() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  // Скрыть кнопку для неавторизованных пользователей
  if (!isAuthenticated) return null;

  return (
    <button 
      onClick={() => setIsEditModalOpen(true)}
      className="flex items-center ml-auto bg-[#000150]/20 px-4 py-3 rounded-[8px] text-[#000150] text-[19px] font-semibold max-h-[47px] hover:bg-[#000150]/30 transition-colors"
    >
      Редактировать
    </button>
  );
}