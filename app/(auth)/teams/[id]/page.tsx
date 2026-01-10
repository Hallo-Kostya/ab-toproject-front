'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Team } from "@/types/teams/team";
import { getTeamById, deleteTeam, removeStudentFromTeam, getTeamProjectsWithDetails, TeamProjectWithDetails } from "@/lib/api/teams";
import { getFullTeamStudents, TeamStudent } from "@/lib/api/students";
import { getMeetingsByTeamId, Meeting } from "@/lib/api/meetings";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from 'next/navigation';
import DeleteTeamModal from '@/components/ui/deleteTeamModal';
import AddStudentToTeamModal from '@/components/ui/addStudentToTeamModal';
import EditTeamModalButton from '@/components/clientModal/team/editTeamModalButton';
import Link from 'next/link';
import ProjectCard from '@/components/ui/cards/project-card';
import DeleteStudentFromTeamModal from '@/components/ui/deleteStudentFromTeamModal';
import MeetingCard from '@/components/ui/cards/meeting-card';

export default function TeamPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };
  const [team, setTeam] = useState<Team | null>(null);
  const [students, setStudents] = useState<TeamStudent[]>([]);
  const [projects, setProjects] = useState<TeamProjectWithDetails[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isDeleteStudentModalOpen, setIsDeleteStudentModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<TeamStudent | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !id) return;

    const fetchTeamData = async () => {
      try {
        setLoading(true);
        const teamData = await getTeamById(id);
        setTeam(teamData);
        
        const studentsData = await getFullTeamStudents(id);
        setStudents(studentsData);

        const projectsData = await getTeamProjectsWithDetails(id);
        setProjects(projectsData);

        // Получаем встречи для команды
        const meetingsData = await getMeetingsByTeamId(id);
        setMeetings(meetingsData);
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки данных команды');
        console.error('Team data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [isAuthenticated, id]);

  const handleRemoveStudent = async (student: TeamStudent) => {
    setStudentToDelete(student);
    setIsDeleteStudentModalOpen(true);
  };

  const handleConfirmRemoveStudent = async () => {
    if (!studentToDelete || !team) return;
    
    try {
      await removeStudentFromTeam(team.id, studentToDelete.id);
      
      // Обновляем список студентов
      const updatedStudents = await getFullTeamStudents(team.id);
      setStudents(updatedStudents);
      
      setIsDeleteStudentModalOpen(false);
      setStudentToDelete(null);
    } catch (err: any) {
      console.error('Failed to remove student from team:', err);
      setError(err.message || 'Ошибка при удалении студента из команды');
    }
  };

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
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
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
          
          <div className="space-y-4">
            <div className="h-7 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
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

  const getMeetingCardStatus = (apiStatus: string): 'planned' | 'completed' | 'cancelled' => {
    switch (apiStatus) {
      case 'SCHEDULED':
        return 'planned';
      case 'COMPLETED':
        return 'completed';
      case 'CANCELLED':
        return 'cancelled';
      default:
        return 'planned';
    }
  };

  return (
    <>
      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <h1 className="text-[28px] font-bold text-[#000150]">{`"${team.name}"`}</h1>
              {/* <p className="text-[28px] font-bold text-[#000150]">
                № {team.number || (Number(id.match(/\d+$/)?.[0]) || 1)}
              </p> */}
              <Link href={team.group_link}
                target=""
                rel=""
                className="text-[16px] text-[#000150] font-semibold"
              >
                <Image src="/telegram.png" width={48} height={48} alt="Ссылка на телеграм-канал команды" />
              </Link>
            </div>
            <div className="flex gap-4 ml-6">
              <EditTeamModalButton 
                teamId={team.id} 
                teamName={team.name}
                initialData={team}
              />
              <button
                onClick={() => setIsAddStudentModalOpen(true)}
                className="text-[19px] text-[#000150] font-semibold py-2 px-4 bg-[#000150]/20 rounded-[20px] hover:bg-[#000150]/30 transition-colors"
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
          <h2 className="text-[24px] font-medium mb-8 text-[#000150]">Участники команды</h2>
          {students.length > 0 ? (
            <ul className="flex flex-col gap-4">
              {students.map((student, index) => (
                <li 
                  key={`team-student-${student.id}-${index}`} 
                  className="flex gap-4 items-center relative group"
                >
                  <span className="w-8 h-8 flex items-center justify-center bg-[#000150]/20 rounded-full text-[#000150] text-[18px] mb-[2px] font-medium">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-[20px]">
                    {student.last_name} {student.first_name} {student.patronymic || ''}
                  </span>
                  <span className="font-semibold text-center w-[124px] ml-auto px-3 py-1 bg-[#000150]/20 rounded-[16px] text-[#000150]">
                    {student.study_group || 'не указана'}
                  </span>
                  <span className="font-semibold text-center w-[135px] ml-[72px] px-3 py-1 bg-[#000150]/20 rounded-[16px] text-[#000150] mr-10">
                    {student.role || 'не указана'}
                  </span>
                  
                  {/* Кнопка удаления студента появляется при наведении */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveStudent(student);
                    }}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-500 hover:text-red-500"
                    title="Удалить студента из команды"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">
              <p>В этой команде пока нет участников</p>
            </div>
          )}
        </div>

        {/* Блок встреч команды */}
        <div className="mt-[36px]">
          <div className="flex items-center justify-between mb-[16px]">
            <h2 className="text-[24px] text-[#000000] font-medium text-[#000150]">Встречи команды</h2>
          </div>
          
          <div className="flex items-center mb-[24px]">
            <p className="text-[18px] text-[#353535]">Встреч найдено: <span className="text-[18px] text-[#000150] font-semibold">{meetings.length}</span></p>
          </div>
          
          {meetings.length > 0 ? (
            <ul className="flex gap-6 flex-wrap">
              {meetings.map((meeting) => (
                <li key={meeting.id}>
                  <Link href={`/meeting/${meeting.id}`}>
                    <MeetingCard 
                      teamName={team.name}
                      name={meeting.name}
                      resume={meeting.resume}
                      date={new Date(meeting.date).toLocaleDateString()}
                      time={new Date(meeting.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      status={getMeetingCardStatus(meeting.status)} // ИСПРАВЛЕНО: конвертация статуса
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">
              <p>У этой команды пока нет запланированных встреч</p>
            </div>
          )}
        </div>

        <div className="mt-[36px]">
          <div className="flex items-center justify-between mb-[16px]">
            <h2 className="text-[24px] text-[#000000] font-medium text-[#000150]">Проекты команды</h2>
          </div>
          
          <div className="flex items-center mb-[24px]">
            <p className="text-[18px] text-[#353535]">Проектов найдено: <span className="text-[18px] text-[#000150] font-semibold">{projects.length}</span></p>
          </div>
          
          {projects.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((projectData) => (
                <li key={projectData.teamProject.id}>
                  <Link href={`/projects/${projectData.teamProject.project_id}`}>
                    <ProjectCard 
                      name={projectData.project.name || 'Без названия'}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">
              <p>Эта команда еще не участвует ни в одном проекте</p>
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

      <DeleteStudentFromTeamModal
        isOpen={isDeleteStudentModalOpen}
        onClose={() => setIsDeleteStudentModalOpen(false)}
        studentId={studentToDelete?.id || ''}
        studentName={`${studentToDelete?.last_name} ${studentToDelete?.first_name}`}
        onConfirm={handleConfirmRemoveStudent}
      />
    </>
  );
}