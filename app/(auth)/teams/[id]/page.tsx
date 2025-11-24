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
            <h1>{team.name}</h1>
            <div>
                <h2>Участники</h2>
                <ul>
                    {enrichedTeam.participants.map((user) =>
                        <li key={user.id}>
                            <span>{user.firstName} {user.lastName} {user.patronymic}</span>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    )
}