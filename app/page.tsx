// import Image from "next/image";
import Link from "next/link";
import { projects } from "@/mocks/projects";
import MeetingList from "@/components/features/meeting-list";
import ProjectCard from "@/components/ui/project-card";

{/* ДЛЯ СТРАНИЦ ProjectsPage (Home) и TeamsPage - СОЗДАТЬ КОМПОНЕНТ */}

export default function Home() {
  return (
    <div>
      <div>
        <h2 className="text-[20px] text-[#000150] font-semibold mb-4">Предстоящие встречи</h2>
        <MeetingList />
      </div>
      <div className="mt-[90px]">
        <div className="flex justify-between">
          <p className="text-[18px] text-[#353535]">Всего проектов найдено: <span className="text-[18px] text-[#000150] font-semibold">{projects.length}</span></p>
          <div className="flex gap-[18px]">
            <p className="text-[18px] text-[#353535]">Сортировать по году: <span className="text-[18px] text-[#000150] font-semibold">{"2025/2026"}</span></p>
            <p className="text-[18px] text-[#353535]">Семестр: <span className="text-[18px] text-[#000150] font-semibold">{"весенний"}</span></p>
          </div>
        </div>
        <ul className="flex gap-6 mt-4">
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
