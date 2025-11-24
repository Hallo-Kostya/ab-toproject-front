import { projects } from "@/mocks/projects/projects";
import MeetingList from "@/components/features/meetings/meeting-list";
import { Project } from "@/types/projects/project";
import ProjectCard from "@/components/ui/cards/project-card";
import PageContainer from "@/components/containers/page-container";

export default function ProjectsPage() {
  const renderProjectCard = (project: Project) => (
    <ProjectCard 
      name={project.name} 
      teamsCnt={2} 
      placesCnt={8} 
    />
  );

  return (
    <PageContainer
      pageTag="projects"
      meetingsTitle="Предстоящие встречи"
      meetingsListComponent={<MeetingList />}
      listHeader="Всего проектов найдено: "
      list={projects}
      cardComponent={renderProjectCard}
      year="2025/2026"
      semester="весенний"
    />
  );
}
