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
                <div className="flex justify-between mb-3">
                    <h1 className="text-[#000150] text-[26px] font-semibold">{project.name} Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati, eligendi.</h1>

                    {/* Форма редактирования информации о проекте */}
                    <div className="flex items-center border-1 border-[#000150] px-4 py-3 rounded text-[#000150] text-[19px] font-semibold max-h-[47px]">
                        Редактировать
                    </div>
                </div>
                <div className="flex items-center gap-[24px]">
                    <p><span className="text-[24px] text-[#000150] font-md">{project.year} year, {project.semester} semester</span></p>
                    <div className="px-3 py-1 border-1 border-[#E79E00] rounded">
                        <span className="text-[#E79E00]">
                            {project.status}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col mt-6 gap-[36px]">
                <Section title={"Описание"} content={project.description} />
                <Section title={"Цель"} content={project.goal} />
                <Section title={"Требования"} content={project.requirements} />
                <Section title={"Критерии"} content={project.criteria} />
            </div>
            <div className="mt-[36px]">
                <h2 className="mb-[16px] text-[24px] text-[#000000] font-md">Команды-исполнители</h2>
                <div className="flex items-center mb-[24px]">
                    <p className="text-[18px] text-[#353535]">Команд найдено: <span className="text-[18px] text-[#000150] font-semibold">{"teamsCnt"}</span></p>
                </div>
                {/* Список команд текущего проекта */}
                <ul className="w-full h-[400px] border-1 border-black rounded">
                    <li></li>
                </ul>
            </div>
        </div>
    )
}

function Section({ title, content }: { title: string; content: string }) {
    return (
        <div>
            <h2 className="text-[24px] text-[#000000] font-md mb-[28px]">{title}</h2>
            <p className="text-[18px]">{content}</p>
        </div>
    )
}