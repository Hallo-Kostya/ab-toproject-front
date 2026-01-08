import { teams } from "@/mocks/teams/teams";
import { Team } from "@/types/teams/team";
import { notFound } from "next/navigation";
import { users } from "@/mocks/users/users";
import { buildTeamWithParticipants } from "@/utils/team";
import EditTeamModalButton from "@/components/clientModal/team/editTeamModalButton";
import Link from "next/link";
import { projects } from "@/mocks/projects/projects";
import ProjectCard from "@/components/ui/cards/project-card";

const usersMap = new Map(users.map((user) => [user.id, user]));

export default async function TeamPage({ params }: { params: Promise<{id: string}> }) {
  const { id } = await params;
  const team: Team | undefined = teams.find((t) => t.id == id);

  if (!team) {
    notFound();
  }

  const enrichedTeam = buildTeamWithParticipants(team, usersMap);

  // Фильтрация проектов только для данной команды
  const teamProjects = projects.filter(project =>
    team.projectsIds.includes(project.id)
  );

  return (
    <div>
      <div className="flex items-center gap-9 mb-4">
        <h1 className="text-[28px] font-bold text-[#000150]">{`"${team.name}"`}</h1>
        <p className="text-[28px] font-bold text-[#000150]">№ {Number(team.id)+1}</p>
        <Link href={team.team_group_link}
        className="text-[16px] text-[#000150] font-semibold p-2 px-3 bg-blue-400/30 rounded-[9px]">Ссылка на телеграмм</Link>
        
        {/* Клиентский компонент для управления модальным окном */}
        <EditTeamModalButton teamId={team.id} teamName={team.name} />
      </div>
      
      <div className="flex items-center mb-7">
        <h2 className="text-[24px] font-medium mr-6">Календарь</h2>
        <button className="text-[16px] text-[#000150] font-md px-4 py-[6px] bg-[#000150]/20 rounded-[8px]">Запланировать встречу</button>
      </div>
      
      {/* КАЛЕНДАРЬ */}
      <div className="w-full h-[531px] bg-black/20 mb-11"></div>
      
      <div className="mb-8">
        <h2 className="text-[24px] font-medium mb-8">Кураторы команды</h2>
        <div className="flex gap-4 items-center">
          <span className="w-9 h-9 flex items-center justify-center bg-[#000150]/10 rounded-full text-[#000150] text-[20px] mb-[2px]">
            {1}
          </span>
          <span className="text-[20px]">{team.curator}</span>
        </div>
      </div>
      
      <div className="mb-12">
        <h2 className="text-[24px] font-medium mb-8">Участники</h2>
        <ul className="flex flex-col gap-4">
          {enrichedTeam.participants.map((user, index) =>
            <li key={user.id} className="flex gap-4 items-center">
              <span className="w-9 h-9 flex items-center justify-center bg-[#000150]/10 rounded-full text-[#000150] text-[20px] mb-[2px]">
                {index + 1}
              </span>
              <span className="flex-1 text-[20px]">{user.firstName} {user.lastName} {user.patronymic}</span>
              <span className="font-semibold text-center w-[124px] ml-auto px-3 py-1 bg-[#000150]/30 rounded-[8px] text-[#000150]">{user.group}</span>
              <span className="font-semibold text-center w-[135px] ml-[72px] px-3 py-1 bg-[#000150]/30 rounded-[8px] text-[#000150]">{user.role}</span>
            </li>
          )}
        </ul>
      </div>
      
      <div>
        <h2 className="text-[24px] font-medium mb-6">Проекты, в которых команда принимала участие</h2>
        <div className="flex items-center mb-[24px]">
          <p className="text-[18px] text-[#353535]">Проектов найдено: <span className="text-[18px] text-[#000150] font-semibold">{teamProjects.length}</span></p>
        </div>
        <div className="">
          {teamProjects.length > 0 ? (
            <ul className="flex gap-[25px]">
              {teamProjects.map((project) =>
                <li key={project.id} className="w-[402px]">
                  <Link href={`/projects/${project.id}`}>
                    {/* Пока что сюда не передаются команды и участники... */}
                    <ProjectCard name={project.name} teamsCnt={project.teamsCnt} placesCnt={project.placesCnt} />
                  </Link>
                </li>
              )}
            </ul>
          ) : (
            <p>Эта команда еще не принимала участие ни в одном из проектов</p>
          )}
        </div>
      </div>
    </div>
  );
}