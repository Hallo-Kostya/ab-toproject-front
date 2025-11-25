import MeetingCard from "@/components/ui/cards/meeting-card";
import { meetings } from "@/mocks/meetings/meetings";
import { teams } from "@/mocks/teams/teams";

export default function MeetingList() {
    const team = teams[0];

    return (
        <ul>
            {meetings.map((meeting) =>
                <li key={meeting.id}>
                    <MeetingCard 
                        teamName={team.name} 
                        name={meeting.name} 
                        resume={meeting.resume} 
                        date={meeting.date}
                        time={meeting.time}
                    />
                </li>
            )}
        </ul>
    )
}