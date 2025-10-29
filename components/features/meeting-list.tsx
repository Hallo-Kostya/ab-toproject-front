import MeetingCard from "../ui/meeting-card";
import { meetings } from "@/mocks/meetings";

export default function MeetingList() {
    return (
        <ul>
            {meetings.map((meeting) =>
                <li key={meeting.id}>
                    <MeetingCard 
                        teamName={"Team 1"} 
                        name={meeting.name} 
                        resume={meeting.resume} 
                        date={meeting.date} 
                    />
                </li>
            )}
        </ul>
    )
}