export type Project = {
    id: string;
    name: string;
    description: string;
    goal: string;
    requirements: string;
    criteria: string;
    year: string;
    semester: string;
    status: 'Working' | 'Under review' | 'Not started';
}

export interface ProjectCardProps {
    name: string;
    teamsCnt: number;
    placesCnt: number;
}