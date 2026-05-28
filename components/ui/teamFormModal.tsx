'use client';

import { useState } from 'react';
import Modal from "@/components/ui/modal";
import { createTeam, CreateTeamData } from "@/lib/api/teams";

interface TeamFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function TeamFormModal({ isOpen, onClose, onSuccess }: TeamFormModalProps) {
  const [name, setName] = useState('');
  const [groupLink, setGroupLink] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const teamData: CreateTeamData = {
        name,
        group_link: groupLink || undefined
      };

      await createTeam(teamData);

      onSuccess?.();
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Ошибка при создании команды');
      console.error('Team creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="px-20">
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
        
        <h2 className="text-2xl text-[#000150] font-bold mb-4">Создать команду</h2>
        <p className="mb-6 text-gray-600">Заполните необходимые поля</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-1 text-[16px] font-medium text-[#000150]">Название команды *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
              placeholder="Введите название команды"
            />
          </div>
          
          <div>
            <label htmlFor="groupLink" className="block mb-1 text-[16px] font-medium text-[#000150]">Ссылка на чат команды</label>
            <input
              type="url"
              id="groupLink"
              value={groupLink}
              onChange={(e) => setGroupLink(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
              placeholder="https://t.me/..."
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
              disabled={isLoading || !name}
              className="flex-1 py-2 px-4 bg-[#000150] text-white rounded-2xl font-medium hover:bg-blue-900 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}