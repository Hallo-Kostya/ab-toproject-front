import MeetingList from "@/components/features/meetings/meeting-list";
import TeamCard from "@/components/ui/cards/team-card";
import { teams } from "@/mocks/teams/teams";
import { Team } from "@/types/teams/team";
import { users } from "@/mocks/users/users";
import { buildTeamWithParticipants } from "@/utils/team";
import PageContainer from "@/components/containers/page-container";

const usersMap = new Map(users.map((user) => [user.id, user]));

export default function TeamsPage() {
    const renderTeamCard = (team: Team, index: number) => {
        const enriched = buildTeamWithParticipants(team, usersMap);

        return (
            <TeamCard 
                name={team.name}
                teamNumber={index + 1}
                participants={enriched.participants}                            
            />
        );
    };

    return (
        <PageContainer
            pageTag="teams"
            meetingsTitle="Предстоящие встречи"
            meetingsListComponent={<MeetingList />}
            listHeader="Всего команд найдено: "
            list={teams}
            cardComponent={renderTeamCard}
        />
    )
}