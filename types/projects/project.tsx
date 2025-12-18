export type Project = {
    id: string;
    name: string;
    description: string;
    goal: string;
    requirements: string;
    criteria: string;
    year: string;
    semester: string;
    status: 'В работе' | 'На рассмотрении' | 'Не начат';
    teamsCnt: number;
    placesCnt: number;
    teamsIds: string[];
}

export interface ProjectCardProps {
    name: string;
    teamsCnt: number;
    placesCnt: number;
}