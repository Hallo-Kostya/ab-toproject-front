export type Meeting = {
    id: string;
    team_id: string;
    name: string;
    resume: string;
    date: string;
    time: string;
    meeting_status: 'planned' | 'complited' | 'cancelled';
    meeting_artifacts: string;
}

export interface MeetingCardProps {
    teamName: string;
    name: string;
    resume: string;
    date: string;
    time: string;
}