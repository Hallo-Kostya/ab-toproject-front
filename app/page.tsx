// import Image from "next/image";
import Link from "next/link";
import { projects } from "@/mocks/projects";
import MeetingList from "@/components/features/meeting-list";
import ProjectCard from "@/components/ui/project-card";

export default function Home() {
  return (
    <div>
      <div>
        <h2>Предстоящие встречи</h2>
        <MeetingList />
      </div>
      <div className="mt-[90px]">
        <div className="flex justify-between">
          <p>Всего проектов найдено: {projects.length}</p>
          <div className="flex gap-3">
            <p>Сортировать по году: <span>{"2025/2026"}</span></p>
            <p>Семестр: <span>{"весенний"}</span></p>
          </div>
        </div>
        <ul className="flex gap-6">
          {projects.map((project) =>
            <li key={project.id}>
              <Link href={`/projects/${project.id}`}>
                <ProjectCard 
                  name={project.name} 
                  teamsCnt={2} 
                  placesCnt={8} 
                />
              </Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
