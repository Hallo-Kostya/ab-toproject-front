'use client';

import { useState, useEffect } from 'react';
import { Project } from "@/types/projects/project";
import { getProjectById } from "@/lib/api/projects";
import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from 'next/navigation';
import DeleteProjectModal from '@/components/ui/deleteProjectModal';
import Image from "next/image";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params as { id: string };
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !id) return;

    const fetchProject = async () => {
      try {
        setLoading(true);
        const data = await getProjectById(id);
        setProject(data);
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки проекта');
        console.error('Project fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
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

  return (
    <>
      <div className="space-y-8">
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <h1 className="text-[#000150] text-[26px] font-semibold">{project.name}</h1>
              {/* Иконка удаления - видна только авторизованным пользователям */}
              {isAuthenticated && user && (
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                  title="Удалить проект"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
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
        
        <div className="flex flex-col gap-[36px]">
          <Section title={"Описание"} content={project.description} />
          <Section title={"Цель"} content={project.goal} />
          <Section title={"Требования"} content={project.requirements} />
          <Section title={"Критерии оценки"} content={project.eval_criteria} />
        </div>
        
        {/* Закомментировано, так как пока не реализовано в API */}
        {/* <div className="mt-[36px]">
          <h2 className="mb-[16px] text-[24px] text-[#000000] font-medium">Команды-исполнители</h2>
          <div className="flex items-center mb-[24px]">
            <p className="text-[18px] text-[#353535]">Команд найдено: <span className="text-[18px] text-[#000150] font-semibold">0</span></p>
          </div>
          <p className="text-gray-500">Функционал отображения команд пока не реализован</p>
        </div> */}
      </div>
      
      <DeleteProjectModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        projectId={project.id}
        projectName={project.name}
      />
    </>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div className="bg-white p-6 rounded-[16px] shadow-sm">
      <h2 className="text-[24px] text-[#000000] font-medium mb-[28px]">{title}</h2>
      <p className="text-[22px] leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  );
}