import MeetingList from "@/components/features/meeting-list";
import TeamCard from "@/components/ui/team-card";
import { teams } from "@/mocks/teams";
import { users } from "@/mocks/users";
import { buildTeamWithParticipants } from "@/utils/team";

const usersMap = new Map(users.map((user) => [user.id, user]));

export default function TeamsPage() {
    return (
        <div>
            <div>
                    <h2>Предстоящие встречи</h2>
                    <MeetingList />
                  </div>
                  <div className="mt-[90px]">
                    <div className="">
                      <p>Всего команд найдено: {teams.length}</p>
                    </div>
                    <ul className="flex gap-6">
                      {teams.map((team, index) => {
                        const enriched = buildTeamWithParticipants(team, usersMap)

                        return (
                          <li key={team.id}>
                            <TeamCard 
                              name={enriched.name} 
                              teamNumber={index + 1} 
                              participants={enriched.participants}                            
                            />
                          </li>
                        )
                      }
                      )}
                    </ul>
                  </div>
        </div>
    )
}