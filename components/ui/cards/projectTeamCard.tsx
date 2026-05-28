'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { TeamSummary } from "@/lib/api/teams";
import { getTeamById, Team } from "@/lib/api/teams";
import { removeTeamFromProject } from '@/lib/api/projects';
import { parseFullName } from "@/lib/api/teams";
import { Student } from "@/lib/api/students";
import Modal from "@/components/ui/modal";
import { useAuth } from "@/context/AuthContext";
import Image from 'next/image';
import { truncateText } from '@/utils/truncateText';

interface ProjectTeamCardProps {
  team: TeamSummary;
  projectId: string;
  onTeamRemoved: () => void;
}

export default function ProjectTeamCard({ team, projectId, onTeamRemoved }: ProjectTeamCardProps) {
  const [teamDetails, setTeamDetails] = useState<Team | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  useAuth();

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);

        const details = await getTeamById(team.id);
        setTeamDetails(details);

        if (team.members && team.members.length > 0) {
          const parsedStudents: Student[] = team.members.map(member => {
            const { first_name, last_name, patronymic } = parseFullName(member.full_name);
            return {
              id: member.id,
              first_name,
              last_name,
              patronymic: patronymic || '',
              email: '',
              tg_link: ''
            };
          });
          setStudents(parsedStudents);
        } else {
          setStudents([]);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.warn(`Failed to load team ${team.id}:`, err);
        setError('Не удалось загрузить данные команды');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [team.id, team.members]);

  const handleRemoveTeam = async () => {
    try {
      await removeTeamFromProject(projectId, team.id);
      onTeamRemoved();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Failed to remove team from project:', error);
      setError('Ошибка при откреплении команды');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col w-full min-h-37.5 px-6 py-6 shadow-md inset-shadow-xs rounded-xl bg-[#FBFAFF] border border-gray-200">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (error || !teamDetails) {
    return (
      <div className="flex flex-col w-full min-h-37.5 px-6 py-6 shadow-md inset-shadow-xs rounded-xl bg-[#FBFAFF] border border-gray-200">
        <div className="text-yellow-600 text-sm">
          {error || 'Данные команды не загружены'}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col w-full min-h-70 px-6 py-6 shadow-md inset-shadow-xs rounded-xl bg-[#FBFAFF] border border-gray-200 hover:shadow-lg transition-shadow relative group">
        {/* Кнопка удаления */}
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-500 hover:text-red-500 z-10"
          title="Открепить команду"
          aria-label="Открепить команду"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Название команды — ссылка */}
        <div className="mb-4 border-b border-[#000150]/40">
          <Link href={`/teams/${teamDetails.id}`} className="w-fit flex items-center justify-between gap-3 pb-3">
            <h2 className="text-[20px] text-[#000150] font-semibold">{truncateText(team.name, 24)}</h2>
            <div className="flex bg-[#000150]/10 rounded-sm py-0.5 px-2 gap-1.5 ml-4 mr-6">
              <Image src={"/user-round.svg"} alt={"К-во участников"} width={20} height={20}/>
              <p className="text-[18px] font-medium">{team.members_count}</p>
            </div>
          </Link>
        </div>
        
        {/* Список студентов */}
        <div className="">
          {students.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {students.map((student, index) => (
                <li key={student.id} className="flex items-start gap-2.5">
                  <span className="w-6 h-6 flex items-center justify-center bg-[#000150]/10 rounded-full text-[#000150] text-xs mb-0.5 shrink-0">
                    {index + 1}
                  </span>
                  <span className="text-[14px] flex-1 wrap-break-word">
                    {student.last_name} {student.first_name} {student.patronymic || ''}
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
        <div className="p-6 bg-white rounded-3xl">
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
            Вы точно хотите открепить команду <span className="font-semibold text-[#000150]">{team.name}</span> от проекта?
          </p>
          
          <div className="flex gap-4 mt-6">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-2xl font-medium hover:bg-gray-300 transition-colors"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleRemoveTeam}
              className="flex-1 py-2 px-4 bg-red-500 text-white rounded-2xl font-medium hover:bg-red-600 transition-colors"
            >
              Открепить
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}