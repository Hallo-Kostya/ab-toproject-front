'use client';

import { useState, useEffect } from 'react';
import Modal from "@/components/ui/modal";
import { getTeams, Team } from "@/lib/api/teams";
import { assignTeamToProject } from "@/lib/api/projects";
import { useAuth } from "@/context/AuthContext";

interface AssignTeamToProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onTeamAssigned: () => void;
}

export default function AssignTeamToProjectModal({ isOpen, onClose, projectId, onTeamAssigned }: AssignTeamToProjectModalProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
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
    if (!selectedTeamId) return;

    setIsLoading(true);
    setError('');

    try {
      const assignData = {
        team_id: selectedTeamId,
        status: 'ACTIVE'
      };

      await assignTeamToProject(projectId, assignData);
      
      // вызываем callback для обновления списка команд проекта
      onTeamAssigned();

      onClose();
      
      // сбрасываем форму
      setSelectedTeamId(null);
      
    } catch (err: any) {
      setError(err.message || 'Ошибка при назначении команды на проект');
      console.error('Assign team to project error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="px-20">
      <div className="p-6 bg-white rounded-[24px]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          aria-label="Закрыть"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <h2 className="text-2xl text-[#000150] font-bold mb-4">Назначить команду на проект</h2>
        <p className="mb-6 text-gray-600">Выберите команду из списка</p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        {loadingTeams ? (
          <div className="text-center py-8">
            <div className="text-xl text-[#000150]">Загрузка команд...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 text-[16px] font-medium text-[#000150]">Выберите команду *</label>
              <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-[12px] p-2">
                {teams.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">Нет доступных команд</p>
                ) : (
                  teams.map((team) => (
                    <button
                      key={team.id}
                      type="button"
                      onClick={() => setSelectedTeamId(team.id)}
                      className={`w-full text-left px-4 py-2 rounded-[8px] mb-1 transition-colors ${
                        selectedTeamId === team.id
                          ? 'bg-[#000150] text-white'
                          : 'hover:bg-gray-100 text-gray-800'
                      }`}
                    >
                      {team.name}
                      <span className="block text-sm text-gray-400">{team.group_link}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
            
            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-[16px] font-medium hover:bg-gray-300 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isLoading || !selectedTeamId}
                className="flex-1 py-2 px-4 bg-[#000150] text-white rounded-[16px] font-medium hover:bg-blue-900 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Назначение...' : 'Назначить команду'}
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}