'use client';

import { useState, useEffect, useCallback } from 'react';
import ProjectCard from "@/components/ui/cards/project-card";
import PageContainer from "@/components/containers/page-container";
import { Project, ProjectSummaryResponse, getProjects } from "@/lib/api/projects";
import { useAuth } from "@/context/AuthContext";
import MeetingList from '@/components/features/meetings/meeting-list';

// Если бекенд вернёт teamsCnt/placesCnt в ProjectSummary — используем их
// Пока заглушка
interface ProjectWithStats extends Project {
  stats: { teamsCnt: number; placesCnt: number };
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ year?: number; semester?: string }>({});
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response: ProjectSummaryResponse = await getProjects(filters);

        const projectsWithStats: ProjectWithStats[] = response.items.map(project => ({
          ...project,
          // TODO: если бекенд вернёт teamsCnt/placesCnt — использовать их:
          // teamsCnt: project.teams_cnt ?? 0,
          // placesCnt: project.places_cnt ?? 0,
          stats: {
            teamsCnt: 0, // заглушка, пока бекенд не вернёт статистику в сводке
            placesCnt: 0
          }
        }));
        
        setProjects(projectsWithStats);
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки проектов');
        console.error('Projects fetch error:', err);
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, filters]);

  // Рендеринг карточки (добавлен индекс в сигнатуру)
  const renderProjectCard = useCallback((project: ProjectWithStats, index: number) => (
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
      year={filters.year?.toString()}
      semester={filters.semester}
    />
  );
}