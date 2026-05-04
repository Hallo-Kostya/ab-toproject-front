'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProjectTeam, removeTeamFromProject } from "@/lib/api/projects";
import { Team, getTeamById } from "@/lib/api/teams";
import { Student, getTeamStudents } from "@/lib/api/students";
import Modal from "@/components/ui/modal";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface ProjectTeamCardProps {
  projectTeam: ProjectTeam;
  projectId: string;
  onTeamRemoved: () => void;
}

export default function ProjectTeamCard({ projectTeam, projectId, onTeamRemoved }: ProjectTeamCardProps) {
  const [teamData, setTeamData] = useState<Team | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const team = await getTeamById(projectTeam.team_id);
        setTeamData(team);

        // Если бекенд вернёт role/study_group они будут в объекте студента
        const teamStudents = await getTeamStudents(projectTeam.team_id);
        setStudents(teamStudents);
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки данных команды');
        console.error('Team fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [projectTeam.team_id]);

  const handleRemoveTeam = async () => {
    try {
      await removeTeamFromProject(projectId, projectTeam.team_id);
      onTeamRemoved();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Failed to remove team from project:', error);
      setError('Ошибка при откреплении команды от проекта');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col w-full min-h-[150px] px-[24px] py-[24px] shadow-md inset-shadow-xs rounded-[12px] bg-[#FBFAFF] border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (error || !teamData) {
    return (
      <div className="flex flex-col w-full min-h-[150px] px-[24px] py-[24px] shadow-md inset-shadow-xs rounded-[12px] bg-[#FBFAFF] border border-gray-200">
        <div className="text-red-500">{error || 'Данные команды не загружены'}</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col w-full min-h-[150px] px-[24px] py-[24px] shadow-md inset-shadow-xs rounded-[12px] bg-[#FBFAFF] border border-gray-200 hover:shadow-lg transition-shadow relative group">
        {/* Кнопка удаления */}
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-500 hover:text-red-500 transition-colors z-10"
          title="Открепить команду"
          aria-label="Открепить команду"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Название команды */}
        <div className="mb-4 border-b border-[#000150]/40">
          <Link href={`/teams/${teamData.id}`} className="block w-fit flex items-center pb-[12px]">
            <h2 className="text-[20px] text-[#000150] font-semibold">{teamData.name}</h2>
            <div className="flex bg-[#000150]/10 rounded-[4px] px-2 py-[2px] gap-[6px] ml-3">
              <Image src={"/user-round.svg"} alt={"К-во участников"} width={20} height={20}/>
              <p className="text-[18px] font-medium">{students.length}</p>
            </div>
          </Link>
        </div>
        
        {/* Список студентов */}
        <div className="overflow-y-auto max-h-[120px]">
          {students.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {students.map((student, index) => (
                <li key={student.id} className="flex items-start gap-[10px]">
                  <span className="w-6 h-6 flex items-center justify-center bg-[#000150]/10 rounded-full text-[#000150] text-xs mb-[2px] flex-shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-[14px] flex-1 break-words">
                    {student.last_name} {student.first_name} {student.patronymic || ''}
                    {/* Если бекенд вернёт role — можно добавить: ({student.role}) */}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">В команде нет студентов</p>
          )}
        </div>
      </div>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} className="px-30">
        <div className="p-6 bg-white rounded-[24px]">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Закрыть"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-2xl text-[#000150] font-bold mb-2 text-center">Открепить команду</h2>
          <p className="mb-6 text-center text-gray-600">
            Вы точно хотите открепить команду <span className="font-semibold text-[#000150]">{teamData.name}</span> от проекта?
          </p>
          
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-[16px] font-medium hover:bg-gray-300 transition-colors"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleRemoveTeam}
              className="flex-1 py-2 px-4 bg-red-500 text-white rounded-[16px] font-medium hover:bg-red-600 transition-colors"
            >
              Открепить
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}