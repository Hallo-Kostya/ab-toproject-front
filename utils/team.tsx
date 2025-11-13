import { Team } from "@/types/teams/team";
import { User } from "@/types/users/user";

export const buildTeamWithParticipants = (
    team: Team,
    usersMap: Map<string, User>
): {name: string; teamNumber: number; participants: User[]} => {
    const participantIds = Array.isArray(team.participantIds) ? team.participantIds : [];

    const participants = participantIds
        .map((id) => usersMap.get(id))
        .filter((user): user is User => user !== undefined);
        
    return {
        name: team.name || 'Команда без названия',
        teamNumber: parseInt(team.id) || 1,
        participants,
    }
}
