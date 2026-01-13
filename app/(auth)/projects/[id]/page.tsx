'use client';

import { useState, useEffect } from 'react';
import { Project, getProjectById, deleteProject, getProjectTeams, ProjectTeam } from "@/lib/api/projects";
import { Team } from "@/lib/api/teams";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from 'next/navigation';
import DeleteProjectModal from '@/components/ui/deleteProjectModal';
import EditProjectForm from '@/components/forms/editProjectForm';
import AssignTeamToProjectModal from '@/components/ui/assignTeamToProjectModal';
import ProjectTeamCard from '@/components/ui/cards/projectTeamCard';

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };
  const [project, setProject] = useState<Project | null>(null);
  const [projectTeams, setProjectTeams] = useState<ProjectTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAssignTeamModalOpen, setIsAssignTeamModalOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !id) return;

    const fetchProjectData = async () => {
      try {
        setLoading(true);
        const projectData = await getProjectById(id);
        setProject(projectData);
        
        const teamsData = await getProjectTeams(id);
        setProjectTeams(teamsData);
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки данных проекта');
        console.error('Project data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [isAuthenticated, id]);

  const handleTeamAssigned = async () => {
    try {
      const teamsData = await getProjectTeams(id);
      setProjectTeams(teamsData);
    } catch (err: any) {
      console.error('Failed to refresh project teams:', err);
      setError('Ошибка обновления списка команд проекта');
    }
  };

  const handleTeamRemoved = async () => {
    try {
      const teamsData = await getProjectTeams(id);
      setProjectTeams(teamsData);
    } catch (err: any) {
      console.error('Failed to refresh project teams after removal:', err);
      setError('Ошибка обновления списка команд проекта');
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

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-[#000150]">Проект не найден</div>
      </div>
    );
  }

  // показываем только команды со статусом 'ACTIVE'
  const activeProjectTeams = projectTeams.filter(team => team.status === 'ACTIVE');

  return (
    <>
      <div className="space-y-8">
        <div>
          <div className="mb-3">
            <div className="flex justify-between items-center">
              <h1 className="text-[#000150] text-[26px] font-semibold">{project.name}</h1>
              {/* Кнопки редактирования и удаления видны только авторизованным пользователям */}
              {isAuthenticated && user && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center ml-auto bg-[#000150]/20 px-4 py-2 rounded-[20px] text-[#000150] text-[19px] font-semibold max-h-[47px]} hover:bg-[#000150]/30 transition-colors shadow-md inset-shadow-xl"
                    title="Редактировать проект"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                    title="Удалить проект"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-[24px]">
            <p><span className="text-[24px] text-[#000150] font-medium">{project.year} год, {project.semester === 'AUTUMN' ? 'Осенний' : 'Весенний'} семестр</span></p>
            <div className="px-3 py-[1px] bg-[#E79E00]/20 rounded-[8px]">
              <span className="text-[#E79E00] text-[20px] font-medium">
                {project.status === 'PLANNED' ? 'Планируется' : 
                 project.status === 'IN_PROGRESS' ? 'В работе' : 'Завершен'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-[18px]">
          <Section title={"Описание"} content={project.description} />
          <Section title={"Цель"} content={project.goal} />
          <Section title={"Требования"} content={project.requirements} />
          <Section title={"Критерии оценки"} content={project.eval_criteria} />
        </div>
        
        {/* Блок с командами проекта: показываем только активные */}
        <div className="mt-[36px]">
          <div className="flex items-center justify-between mb-[16px]">
            <h2 className="text-[24px] text-[#000150] font-medium">Команды-исполнители</h2>
            {isAuthenticated && user && (
              <button
                onClick={() => setIsAssignTeamModalOpen(true)}
                className="px-4 py-2 bg-[#000150] text-white rounded-[20px] hover:bg-blue-900 transition-colors"
              >
                + Команда
              </button>
            )}
          </div>
          
          <div className="flex items-center mb-[24px]">
            <p className="text-[18px] text-[#353535]">Активных команд найдено: <span className="text-[18px] text-[#000150] font-semibold">{activeProjectTeams.length}</span></p>
          </div>
          
          {activeProjectTeams.length > 0 ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeProjectTeams.map((projectTeam) => (
                <li key={projectTeam.id}>
                  <ProjectTeamCard 
                    projectTeam={projectTeam} 
                    projectId={project.id} 
                    onTeamRemoved={handleTeamRemoved} 
                  />
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-500">
              <p>К этому проекту еще нет активных команд</p>
              {isAuthenticated && user && (
                <p className="mt-2 text-sm">{ 'Нажмите "+ Команда" чтобы назначить команду на проект' }</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      <DeleteProjectModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        projectId={project.id}
        projectName={project.name}
      />
      
      {project && (
        <EditProjectForm
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          projectId={project.id}
          initialData={project}
        />
      )}
      
      <AssignTeamToProjectModal
        isOpen={isAssignTeamModalOpen}
        onClose={() => setIsAssignTeamModalOpen(false)}
        projectId={project.id}
        onTeamAssigned={handleTeamAssigned}
      />
    </>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    // <div className="bg-white p-4 rounded-[16px] shadow-sm inset-shadow-sm">
    <div className="border-b-1 border-gray-300/40">
      <h2 className="text-[24px] text-[#000150] font-medium mb-[28px]">{title}</h2>
      <p className="text-[22px] leading-relaxed whitespace-pre-wrap pb-[18px]">{content}</p>
    </div>
  );
}