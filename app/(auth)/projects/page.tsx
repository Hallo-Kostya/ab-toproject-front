'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProjectCard from "@/components/ui/cards/project-card";
import PageContainer from "@/components/containers/page-container";
import { Project, ProjectsResponse, getProjects } from "@/lib/api/projects";
import { useAuth } from "@/context/AuthContext";
import MeetingList from '@/components/features/meetings/meeting-list';

interface ProjectWithCounts extends Project {
  teams_count: number; 
  members_count: number;
}

export default function ProjectsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [projects, setProjects] = useState<ProjectWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<{
    year?: number;
    semester?: 'SPRING' | 'AUTUMN';
  }>(() => {
    const year = searchParams.get('year');
    const semester = searchParams.get('semester') as 'SPRING' | 'AUTUMN' | null;
    return {
      year: year ? Number(year) : undefined,
      semester: semester && ['SPRING', 'AUTUMN'].includes(semester) ? semester : undefined
    };
  });
  
  const { isAuthenticated } = useAuth();

  const updateFilters = useCallback((newFilters: { year?: number | null; semester?: 'SPRING' | 'AUTUMN' | null }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (newFilters.year === null) {
      params.delete('year');
    } else if (newFilters.year !== undefined) {
      params.set('year', newFilters.year.toString());
    }

    if (newFilters.semester === null) {
      params.delete('semester');
    } else if (newFilters.semester !== undefined) {
      params.set('semester', newFilters.semester);
    }

    setFilters(prev => ({
      ...prev,
      year: newFilters.year === null ? undefined : newFilters.year ?? prev.year,
      semester: newFilters.semester === null ? undefined : newFilters.semester ?? prev.semester
    }));

    const queryString = params.toString();
    router.replace(queryString ? `?${queryString}` : '/projects', { scroll: false });
  }, [searchParams, router]);

  const handleYearChange = useCallback((year: string | null) => {
    updateFilters({ year: year ? Number(year) : null });
  }, [updateFilters]);

  const handleSemesterChange = useCallback((semester: string | null) => {
    updateFilters({ semester: semester as 'SPRING' | 'AUTUMN' | null });
  }, [updateFilters]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response: ProjectsResponse = await getProjects(filters);

        const projectsWithCounts: ProjectWithCounts[] = response.projects.map(project => ({
          ...project,
          teams_count: project.teams_count ?? 0,
          members_count: project.members_count ?? 0
        }));
        
        setProjects(projectsWithCounts);
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

  // Рендеринг карточки
  const renderProjectCard = useCallback((project: ProjectWithCounts) => (
    <ProjectCard 
      key={project.id}
      name={project.name} 
      description={project.description}
      teamsCnt={project.teams_count}
      placesCnt={project.members_count}
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
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
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
      onYearChange={handleYearChange}
      onSemesterChange={handleSemesterChange}
    />
  );
}