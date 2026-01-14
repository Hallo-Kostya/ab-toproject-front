'use client';

import { useState, useEffect, useCallback } from 'react';
import ProjectCard from "@/components/ui/cards/project-card";
import PageContainer from "@/components/containers/page-container";
import { Project } from "@/types/projects/project";
import { getProjects } from "@/lib/api/projects";
import { useAuth } from "@/context/AuthContext";
import { getProjectStats, ProjectStats } from "@/lib/api/project-stats";
import MeetingList from '@/components/features/meetings/meeting-list';

interface ProjectWithStats extends Project {
  stats: ProjectStats;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // функция для получения статистики для одного проекта
  const fetchProjectStats = useCallback(async (project: Project): Promise<ProjectWithStats> => {
    const stats = await getProjectStats(project.id);
    return { ...project, stats };
  }, []);

  // функция для получения статистики для всех проектов
  const fetchAllProjectsStats = useCallback(async (projects: Project[]) => {
    try {
      // параллельно получаем статистику для всех проектов
      const statsPromises = projects.map(project => fetchProjectStats(project));
      const projectsWithStats = await Promise.all(statsPromises);
      
      // сортируем по количеству команд
      projectsWithStats.sort((a, b) => b.stats.teamsCnt - a.stats.teamsCnt);
      
      setProjects(projectsWithStats);
    } catch (err: any) {
      console.error('Failed to fetch projects stats:', err);
      // при ошибке в статистике показываем проекты с нулевой статистикой
      const projectsWithDefaultStats = projects.map(project => ({
        ...project,
        stats: { teamsCnt: 0, placesCnt: 0 }
      }));
      setProjects(projectsWithDefaultStats);
    }
  }, [fetchProjectStats]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // получаем базовые данные проектов
        const projectsData = await getProjects();
        
        // получаем статистику для каждого проекта
        await fetchAllProjectsStats(projectsData);
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки проектов');
        console.error('Projects fetch error:', err);
        setProjects([]); // очищаем список при полной ошибке
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, fetchAllProjectsStats]);

  // рендеринг карточки с обновленными пропсами
  const renderProjectCard = useCallback((project: ProjectWithStats) => (
    <ProjectCard 
      key={project.id}
      name={project.name} 
      description={project.description}
      teamsCnt={project.stats.teamsCnt}
      placesCnt={project.stats.placesCnt}
    />
  ), []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-[#000150]">Загрузка проектов...</div>
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

  return (
    <PageContainer
      pageTag="projects"
      meetingsTitle="Предстоящие встречи"
      meetingsListComponent={<MeetingList />}
      listHeader="Всего проектов найдено: "
      list={projects}
      cardComponent={renderProjectCard}
      year="не указан"
      semester="не указан"
    />
  );
}