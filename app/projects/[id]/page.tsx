import { Project } from "@/types/project";
import { projects } from "@/mocks/projects";
import { notFound } from "next/navigation";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> } ) {
    const { id } = await params;
    const project: Project | undefined = projects.find((p) => p.id === id);

    if (!project) {
        notFound();
    }

    return (
        <div>
            <div>
                <h1>{project.name}</h1>
                <div>
                    <p><span>{project.year} year</span></p>
                    <p><span>{project.semester} semester</span></p>
                    <div>
                        {project.status}
                    </div>
                </div>
            </div>
            <div>
                <Section title={"Описание"} content={project.description} />
                <Section title={"Цель"} content={project.goal} />
                <Section title={"Требования"} content={project.requirements} />
                <Section title={"Критерии"} content={project.criteria} />
            </div>
            <div>
                <h2>Команды-исполнители</h2>
                <div>
                    <p><span>Команд найдено: {"teamsCnt"}</span></p>
                </div>
                {/* Список команд текущего проекта */}
                <ul>
                    <li></li>
                </ul>
            </div>
        </div>
    )
}

function Section({ title, content }: { title: string; content: string }) {
    return (
        <div>
            <h2>{title}</h2>
            <p>{content}</p>
        </div>
    )
}