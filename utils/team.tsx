import { Team } from "@/types/team";
import { User } from "@/types/user";

export const buildTeamWithParticipants = (
    team: Team,
    usersMap: Map<string, User>
): {name: string; teamNumber: number; participants: User[]} => {
    const participants = team.participantIds
        .map((id) => usersMap.get(id))
        .filter((user): user is User => user !== undefined);
        
    return {
        name: team.name,
        teamNumber: parseInt(team.id),
        participants,
    }
}
