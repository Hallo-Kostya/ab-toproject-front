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
    project_id: string;
    name: string;
    resume: string;
    date: string;
    time: string;
    meeting_status: 'planned' | 'completed' | 'cancelled';
    meeting_artifacts: string[];
    notes?: string;
    tasks: Task[];
    meeting_link?: string;
    duration?: string;
    location?: string;
}

export interface MeetingCardProps {
    teamName: string;
    name: string;
    resume: string;
    date: string;
    time: string;
    status: 'planned' | 'completed' | 'cancelled';
}