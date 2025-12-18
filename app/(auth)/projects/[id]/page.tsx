import { Project } from "@/types/projects/project";
import { projects } from "@/mocks/projects/projects";
import { notFound } from "next/navigation";
import EditProjectModalButton from "@/components/clientModal/project/editProjectModalButton";
import { teams } from "@/mocks/teams/teams";
import Link from "next/link";
import { users } from "@/mocks/users/users";
// import { Team } from "@/types/teams/team";
import TeamCard from "@/components/ui/cards/team-card";
import { buildTeamWithParticipants } from "@/utils/team";

const usersMap = new Map(users.map((user) => [user.id, user]));

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> } ) {
    const { id } = await params;
    const project: Project | undefined = projects.find((p) => p.id === id);

    if (!project) {
        notFound();
    }

    // Фильтрация команд только для данного проекта
    const projectTeams = teams.filter(team =>
        project.teamsIds?.includes(team.id) || false
    );

    return (
        <div>
            <div>
                <div className="flex gap-2 mb-3">
                    <h1 className="text-[#000150] text-[26px] font-semibold">{project.name}</h1>

                    {/* Клиентский компонент для управления модальным окном */}
                   <EditProjectModalButton />
                </div>
                <div className="flex items-center gap-[24px]">
                    <p><span className="text-[24px] text-[#000150] font-md">{project.year} год, {project.semester} семестр</span></p>
                    <div className="px-3 py-[1px] bg-[#E79E00]/20 rounded-[8px]">
                        <span className="text-[#E79E00] text-[20px] font-medium">
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
                <h2 className="mb-[16px] text-[24px] text-[#000000] font-medium">Команды-исполнители</h2>
                <div className="flex items-center mb-[24px]">
                    <p className="text-[18px] text-[#353535]">Команд найдено: <span className="text-[18px] text-[#000150] font-semibold">{projectTeams.length}</span></p>
                </div>
                {/* Список команд текущего проекта */}
                <div>
                    {projectTeams.length > 0 ? (
                        <ul className="flex gap-[25px]">
                            {projectTeams.map((team) => {
                                const enrichedTeam = buildTeamWithParticipants(team, usersMap);

                                return (
                                    <li key={team.id} className="w-[402px]">
                                        <Link href={`/teams/${team.id}`}>
                                            <TeamCard 
                                            name={enrichedTeam.name} 
                                            teamNumber={enrichedTeam.teamNumber} 
                                            participants={enrichedTeam.participants} />
                                        </Link>
                                    </li>
                                )} 
                            )}
                        </ul>
                    ) : (
                        <p>В данном проекте не принимало участие ни одна команда</p>
                    )}
                </div>
            </div>
        </div>
    )
}

function Section({ title, content }: { title: string; content: string }) {
    return (
        <div>
            <h2 className="text-[24px] text-[#000000] font-medium mb-[28px]">{title}</h2>
            <p className="text-[22px]">{content}</p>
        </div>
    )
}