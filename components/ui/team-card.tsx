import { TeamCardProps } from "@/types/team";

export default function TeamCard({ name, teamNumber, participants }: TeamCardProps) {
    return (
        <div>
            <div className="flex justify-between">
                <h2>{name}</h2>
                <p><span>{participants.length}</span></p>
                <p>№{teamNumber}</p>
            </div>
            
            <div>
                <h3>Список участников</h3>
                <ul>
                    {participants.map((participant) =>
                        <li key={participant.id}>
                            <span>{participant.firstName} {participant.lastName} {participant?.patronymic}</span>
                        </li>
                    )}
                </ul>
            </div>
        </div>
    )
}