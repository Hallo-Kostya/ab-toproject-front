'use client';

import { useState, useEffect } from 'react';
import { Team } from "@/types/teams/team";
import { getTeamById, deleteTeam } from "@/lib/api/teams";
import { getFullTeamStudents, TeamStudent } from "@/lib/api/students";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from 'next/navigation';
import DeleteTeamModal from '@/components/ui/deleteTeamModal';
import AddStudentToTeamModal from '@/components/ui/addStudentToTeamModal';

export default function TeamPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };
  const [team, setTeam] = useState<Team | null>(null);
  const [students, setStudents] = useState<TeamStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !id) return;

    const fetchTeamData = async () => {
      try {
        setLoading(true);
        const teamData = await getTeamById(id);
        setTeam(teamData);
        
        const studentsData = await getFullTeamStudents(id);
        setStudents(studentsData); // Теперь типы совместимы
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки данных команды');
        console.error('Team data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [isAuthenticated, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col gap-6">
        {/* Ghost загрузки */}
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        </div>
        
        <div className="space-y-6 mt-8">
          <div className="space-y-4">
            <div className="h-7 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
          </div>
          
          <div className="space-y-4">
            <div className="h-7 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
          </div>
          
          <div className="space-y-4">
            <div className="h-7 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-[#000150]">Команда не найдена</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <h1 className="text-[28px] font-bold text-[#000150]">{`"${team.name}"`}</h1>
              {/* Исправлено: используем team.number если есть, иначе порядковый номер */}
              <p className="text-[28px] font-bold text-[#000150]">
                № {team.number || (Number(id.match(/\d+$/)?.[0]) || 1)}
              </p>
              <a href={team.group_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[16px] text-[#000150] font-semibold p-2 px-3 bg-blue-400/30 rounded-[9px] hover:bg-blue-500/30 transition-colors"
              >
                Ссылка на группу
              </a>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setIsAddStudentModalOpen(true)}
                className="text-[16px] text-[#000150] font-semibold p-2 px-3 bg-[#000150]/20 rounded-[8px] hover:bg-[#000150]/30 transition-colors"
              >
                Добавить участника
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                title="Удалить команду"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-[24px] font-medium mb-8">Участники команды</h2>
          {students.length > 0 ? (
            <ul className="flex flex-col gap-4">
              {students.map((student, index) => (
                <li 
                  key={`team-student-${student.id}-${index}`} 
                  className="flex gap-4 items-center"
                >
                  <span className="w-9 h-9 flex items-center justify-center bg-[#000150]/10 rounded-full text-[#000150] text-[20px] mb-[2px]">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-[20px]">
                    {student.last_name} {student.first_name} {student.patronymic || ''}
                  </span>
                  <span className="font-semibold text-center w-[124px] ml-auto px-3 py-1 bg-[#000150]/30 rounded-[8px] text-[#000150]">
                    {student.study_group || 'не указана'}
                  </span>
                  <span className="font-semibold text-center w-[135px] ml-[72px] px-3 py-1 bg-[#000150]/30 rounded-[8px] text-[#000150]">
                    {student.role || 'не указана'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">
              <p>В этой команде пока нет участников</p>
            </div>
          )}
        </div>
      </div>
      
      <DeleteTeamModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        teamId={team.id}
        teamName={team.name}
      />
      
      <AddStudentToTeamModal
        isOpen={isAddStudentModalOpen}
        onClose={() => setIsAddStudentModalOpen(false)}
        teamId={team.id}
        onStudentAdded={async () => {
          try {
            const updatedStudents = await getFullTeamStudents(team.id);
            setStudents(updatedStudents);
          } catch (err: any) {
            console.error('Failed to refresh team students:', err);
            setError('Ошибка обновления списка студентов');
          }
        }}
      />
    </>
  );
}