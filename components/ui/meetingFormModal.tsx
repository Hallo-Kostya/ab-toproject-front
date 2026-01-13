'use client';

import { useState, useEffect } from 'react';
import Modal from "@/components/ui/modal";
import { createMeeting } from "@/lib/api/meetings";
import { getTeams, Team } from "@/lib/api/teams";
import { useAuth } from "@/context/AuthContext";

export default function MeetingFormModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [name, setName] = useState('');
  const [resume, setResume] = useState('');
  const [date, setDate] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [status, setStatus] = useState('SCHEDULED');
  const [previousMeetingId, setPreviousMeetingId] = useState<string | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchTeams();
    }
  }, [isOpen, isAuthenticated]);

  const fetchTeams = async () => {
    try {
      setLoadingTeams(true);
      const data = await getTeams();
      setTeams(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки команд');
      console.error('Teams fetch error:', err);
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeamId) {
      setError('Пожалуйста, выберите команду');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const meetingData = {
        name,
        resume,
        date,
        team_id: selectedTeamId,
        status,
        previous_meeting_id: previousMeetingId
      };

      await createMeeting(meetingData);

      onClose();
      
      // обновляем страницу
      setTimeout(() => {
        window.location.reload();
      }, 300);
      
    } catch (err: any) {
      setError(err.message || 'Ошибка при создании встречи');
      console.error('Meeting creation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 bg-white rounded-[24px]">
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
        
        <h2 className="text-2xl text-[#000150] font-bold mb-4">Создать встречу</h2>
        <p className="mb-6 text-gray-600">Заполните все обязательные поля</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-1 text-[16px] font-medium text-[#000150]">Название встречи *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-[12px] border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
              placeholder="Введите название встречи"
            />
          </div>
          
          <div>
            <label htmlFor="resume" className="block mb-1 text-[16px] font-medium text-[#000150]">Резюме *</label>
            <textarea
              id="resume"
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-2 rounded-[12px] border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
              placeholder="Краткое описание встречи"
            />
          </div>
          
          <div>
            <label htmlFor="date" className="block mb-1 text-[16px] font-medium text-[#000150]">Дата и время *</label>
            <input
              type="datetime-local"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-[12px] border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
            />
          </div>
          
          <div>
            <label htmlFor="team" className="block mb-1 text-[16px] font-medium text-[#000150]">Выберите команду *</label>
            <select
              id="team"
              value={selectedTeamId || ''}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-[12px] border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
            >
              <option value="">Выберите команду</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
            {loadingTeams && <p className="text-sm text-gray-500 mt-1">Загрузка команд...</p>}
          </div>
          
          <div>
            <label htmlFor="status" className="block mb-1 text-[16px] font-medium text-[#000150]">Статус *</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-[12px] border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
            >
              <option value="SCHEDULED">Запланирована</option>
              <option value="COMPLETED">Завершена</option>
              <option value="CANCELLED">Отменена</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="previousMeeting" className="block mb-1 text-[16px] font-medium text-[#000150]">Предыдущая встреча</label>
            <select
              id="previousMeeting"
              value={previousMeetingId || ''}
              onChange={(e) => setPreviousMeetingId(e.target.value || null)}
              className="w-full px-4 py-2 rounded-[12px] border-2 border-gray-300 focus:border-[#000150] focus:ring-2 focus:ring-[#000150]/20"
            >
              <option value="">Не выбрана</option>
              {/* Здесь можно добавить список предыдущих встреч, если нужно */}
            </select>
          </div>
          
          <div className="flex gap-4 mt-10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-[16px] font-medium hover:bg-gray-300 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isLoading || loadingTeams}
              className="flex-1 py-2 px-4 bg-[#000150] text-white rounded-[16px] font-medium hover:bg-blue-900 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}