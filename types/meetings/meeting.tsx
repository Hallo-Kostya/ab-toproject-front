// TODO: Check unusual ifaces

export type Task = {
    id: string;
    description: string;
    status: 'not_started' | 'in_progress' | 'completed';
    assignee_id?: string;
    due_date?: string;
};

export type Meeting = {
    id: string;
    team_id: string;
    name: string;
    resume: string;
    date: string;
    time?: string;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELED' | 'IN_PROGRESS';
    previous_meeting_id: string | null;
    next_meeting_id: string | null;
}

export interface MeetingCardProps {
    teamName: string;
    name: string;
    resume: string;
    date: string;
    time: string;
    status: 'scheduled' | 'completed' | 'canceled' | 'in_progress';
}