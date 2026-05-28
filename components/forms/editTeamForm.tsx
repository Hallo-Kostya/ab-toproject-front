'use client';

import { useState, useEffect } from 'react';
import Modal from "@/components/ui/modal";
import { updateTeam, Team, CreateTeamData } from "@/lib/api/teams";

interface EditTeamFormProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  initialData: Team;
}

export default function EditTeamForm({ isOpen, onClose, teamId, initialData }: EditTeamFormProps) {
  const [name, setName] = useState(initialData.name);
  const [groupLink, setGroupLink] = useState(initialData.group_link ?? '');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // обновляем данные формы при изменении initialData
    setName(initialData.name);
    setGroupLink(initialData.group_link ?? '');
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const teamData: Partial<CreateTeamData> = {
        name,
        group_link: groupLink.trim() === '' ? null : groupLink.trim()
      };

      await updateTeam(teamId, teamData);

      onClose();
      
      // обновляем страницу
      setTimeout(() => {
        window.location.reload();
      }, 300);
      
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Ошибка при редактировании команды');
      console.error('Team update error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="px-20">
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
        
        <h2 className="text-2xl text-[#000150] font-bold mb-4">Редактировать команду</h2>
        <p className="mb-6 text-gray-500">* Измените необходимые поля</p>
        
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
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
              placeholder="Введите название команды"
            />
          </div>
          
          <div>
            <label htmlFor="groupLink" className="block mb-1 text-[16px] font-medium text-[#000150]">Ссылка на группу</label>
            <input
              type="url"
              id="groupLink"
              value={groupLink}
              onChange={(e) => setGroupLink(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
              placeholder="https://t.me/team_group"
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
              className="flex-1 py-2 px-4 bg-[#000150] text-white rounded-2xl font-medium hover:bg-blue-900 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}