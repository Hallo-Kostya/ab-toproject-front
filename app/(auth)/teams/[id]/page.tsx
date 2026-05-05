'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Team, getTeamById, removeStudentFromTeam, getTeamProjects } from "@/lib/api/teams";
import { Student, getTeamStudents } from "@/lib/api/students";
import { Meeting, getMeetings } from "@/lib/api/meetings";
import { Project } from "@/lib/api/projects";
import { useAuth } from "@/context/AuthContext";
import { useParams } from 'next/navigation';
import DeleteTeamModal from '@/components/ui/deleteTeamModal';
import AddStudentToTeamModal from '@/components/ui/addStudentToTeamModal';
import EditTeamModalButton from '@/components/clientModal/team/editTeamModalButton';
import ProjectCard from '@/components/ui/cards/project-card';
import MeetingCard from '@/components/ui/cards/meeting-card';
import DeleteStudentFromTeamModal from '@/components/ui/deleteStudentFromTeamModal';

export default function TeamPage() {
  const params = useParams();
  const { id } = params as { id: string };
  
  const [team, setTeam] = useState<Team | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isDeleteStudentModalOpen, setIsDeleteStudentModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  
  const { isAuthenticated } = useAuth();

  const getMeetingCardStatus = (apiStatus: string): 'scheduled' | 'completed' | 'canceled' | 'in_progress' => {
    switch (apiStatus?.toUpperCase()) {
      case 'SCHEDULED': return 'scheduled';
      case 'COMPLETED': return 'completed';
      case 'CANCELED': return 'canceled';
      case 'IN_PROGRESS': return 'in_progress';
      default: return 'scheduled';
    }
  };

  useEffect(() => {
    if (!isAuthenticated || !id) return;

    const fetchTeamData = async () => {
      try {
        setLoading(true);
        setError(null);

        const teamData = await getTeamById(id);
        setTeam(teamData);

        const studentsData = await getTeamStudents(id);
        setStudents(studentsData);

        const projectsData = await getTeamProjects(id);
        setProjects(projectsData);

        const meetingsData = await getMeetings({ team_id: id });
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

  const handleRemoveStudent = (student: Student) => {
    setStudentToDelete(student);
    setIsDeleteStudentModalOpen(true);
  };

  const handleConfirmRemoveStudent = async () => {
    if (!studentToDelete || !team) return;
    
    try {
      await removeStudentFromTeam(team.id, studentToDelete.id);
      const updatedStudents = await getTeamStudents(team.id);
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
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
        </div>
        <div className="space-y-6 mt-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-7 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
              <div className={`h-4 bg-gray-200 rounded animate-pulse ${i % 2 === 0 ? 'w-3/4' : 'w-2/3'}`}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
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
              {team.group_link && (
                <Link href={team.group_link} target="_blank" rel="noopener noreferrer"
                  className="text-[16px] text-[#000150] font-semibold"
                >
                  <div className="rounded-full p-1 border border-gray-500/20 shadow-sm">
                    <Image src="/tg.webp" className="rounded-full" width={36} height={36} alt="Telegram" />
                  </div>
                </Link>
              )}
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
        
        {/* Участники команды */}
        <div className="mb-12">
          <h2 className="text-[24px] font-medium mb-8 text-[#000150]">Участники команды</h2>
          {students.length > 0 ? (
            <ul className="flex flex-col gap-4">
              {students.map((student, index) => (
                <li key={student.id} className="flex gap-4 items-center relative group">
                  <span className="w-8 h-8 flex items-center justify-center bg-[#000150]/20 rounded-full text-[#000150] text-[18px] font-medium">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-[20px]">
                    {student.last_name} {student.first_name} {student.patronymic || ''}
                  </span>
                  <div className="mr-10 flex gap-4">
                    <span className="flex-1 text-[16px] p-1 px-3 bg-[#000150]/20 rounded-xl text-[#000150] font-medium text-nowrap">
                      {student.role || 'Не указано'}
                    </span>
                    <span className="flex-1 text-[16px] p-1 px-3 bg-[#000150]/20 rounded-xl text-[#000150] font-medium text-nowrap">
                      {student.study_group || 'Не указано'}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveStudent(student); }}
                    className="absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-500 hover:text-red-500"
                    title="Удалить студента"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">В этой команде пока нет участников</p>
          )}
        </div>

        {/* Встречи команды */}
        <div className="mt-9">
          <h2 className="text-[24px] text-[#000150] font-medium mb-4">Встречи команды</h2>
          {meetings.length > 0 ? (
            <ul className="flex gap-6 flex-wrap">
              {meetings.map((meeting) => (
                <li key={meeting.id}>
                  <Link href={`/meeting/${meeting.id}`}>
                    <MeetingCard 
                      teamName={team.name}
                      name={meeting.name}
                      resume={meeting.resume}
                      date={new Date(meeting.date).toLocaleDateString('ru-RU')}
                      time={new Date(meeting.date).toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}
                      status={getMeetingCardStatus(meeting.status)}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">У этой команды пока нет запланированных встреч</p>
          )}
        </div>

        {/* Проекты команды */}
        <div className="mt-9">
          <h2 className="text-[24px] text-[#000150] font-medium mb-4">Проекты команды</h2>
          {projects.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <li key={project.id}>
                  <Link href={`/projects/${project.id}`}>
                    <ProjectCard 
                      name={project.name || 'Без названия'}
                      description={project.description || 'Без описания'}
                      teamsCnt={(project as Project).teams_count ?? 0}
                      placesCnt={(project as Project).members_count ?? 0}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Эта команда еще не участвует ни в одном проекте</p>
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
            const updatedStudents = await getTeamStudents(team.id);
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