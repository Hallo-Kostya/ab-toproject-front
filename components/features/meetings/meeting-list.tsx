import MeetingCard from "@/components/ui/cards/meeting-card";
import { meetings } from "@/mocks/meetings/meetings";
import { teams } from "@/mocks/teams/teams";
import Link from "next/link";

{/* ДОРАБОТКА ФУНКЦИОНАЛА */}

export default function MeetingList() {
    // Вместо явного указания в будущем нужно сделать динамическое указание команд
    const team = teams[1];

    return (
        <ul>
            {meetings.map((meeting) =>
                <li key={meeting.id}>
                    <Link href={`/meeting/${meeting.id}`}>
                        <MeetingCard 
                            teamName={team.name}
                            name={meeting.name}
                            resume={meeting.resume}
                            date={meeting.date}
                            time={meeting.time} 
                            status={"planned"}                        />
                    </Link>
                </li>
            )}
        </ul>
    )
}