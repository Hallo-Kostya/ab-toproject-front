'use client';

import { useState, useEffect } from 'react';
import MeetingList from "@/components/features/meetings/meeting-list";
import ProjectCard from "@/components/ui/cards/project-card";
import PageContainer from "@/components/containers/page-container";
import { Project } from "@/types/projects/project";
import { getProjects } from "@/lib/api/projects";
import { useAuth } from "@/context/AuthContext";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const renderProjectCard = (project: Project) => (
    <ProjectCard 
      name={project.name} 
      // teamsCnt={0}
      // placesCnt={0}
    />
  );

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await getProjects();
        setProjects(data);
      } catch (err: any) {
        setError(err.message || 'Ошибка загрузки проектов');
        console.error('Projects fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [isAuthenticated]);

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