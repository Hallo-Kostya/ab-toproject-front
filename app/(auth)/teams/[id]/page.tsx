import { teams } from "@/mocks/teams/teams";
import { Team } from "@/types/teams/team";
import { notFound } from "next/navigation";
import { users } from "@/mocks/users/users";
import { buildTeamWithParticipants } from "@/utils/team";

const usersMap = new Map(users.map((user) => [user.id, user]));

export default async function TeamPage({ params }: { params: Promise<{id: string}> }) {
    const { id } = await params;
    const team: Team | undefined = teams.find((t) => t.id == id);

    if (!team) {
        notFound();
    }

    const enrichedTeam = buildTeamWithParticipants(team, usersMap);

    return (
        <div>
            <div className="flex items-center gap-9 mb-4">
                <h1 className="text-[28px] font-bold text-[#000150]">{team.name}</h1>
                <p className="text-[28px] font-bold text-[#000150]">№ {Number(team.id)+1}</p>
                <p className="text-[16px] font-semibold p-2 px-3 bg-indigo-200/40 rounded-[9px]">Ссылка</p>
                <button className="flex items-center ml-auto border-1 border-[#000150] px-4 py-3 rounded-[8px] text-[#000150] text-[19px] font-semibold max-h-[47px]">
                    Редактировать
                </button>
            </div>
            <div className="flex items-center mb-7">
                <h2 className="text-[24px] font-md mr-6">Календарь</h2>
                <button className="text-[16px] text-[#000150] font-md px-4 py-[6px] bg-indigo-400/20 rounded-[8px]">Запланировать встречу</button>
            </div>
            {/* КАЛЕНДАРЬ */}
            <div className="w-full h-[531px] bg-black/20 mb-11">

            </div>
            <div className="mb-8">
                <h2 className="text-[24px] font-md mb-8">Кураторы команды</h2>
                <div className="w-full h-[120px] bg-black/20">

                </div>
            </div>
            <div className="mb-12">
                <h2 className="text-[24px] font-md mb-8">Участники</h2>
                <ul className="flex flex-col gap-4">
                    {enrichedTeam.participants.map((user) =>
                        <li key={user.id}>
                            <span className="text-[20px] font-md">{user.firstName} {user.lastName} {user.patronymic}</span>
                        </li>
                    )}
                </ul>
            </div>
            <div>
                <h2 className="text-[24px] font-md mb-6">Проекты, в которых команда принимала участие</h2>
                <div className="w-full h-[543px] bg-black/20">

                </div>
            </div>
        </div>
    )
}