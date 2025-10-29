import { MeetingCardProps } from "@/types/meeting";

export default function MeetingCard({ teamName, name, resume, date}: MeetingCardProps) {
    return (
        <div>
            <div>
                <h2>{teamName}</h2>
            </div>
            <div>
                <p><span>{name}</span></p>
                <p>{resume}</p>
            </div>
            <div>
                <p><span>{date}</span></p>
            </div>
        </div>
    )
}