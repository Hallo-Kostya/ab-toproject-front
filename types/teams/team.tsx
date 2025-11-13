import { User } from "../users/user";

export type Team = {
    id: string;
    project_id: string;
    name: string;
    curator: string;
    team_group_link: string;
    team_artifacts: string;
    participantIds: string[];
}

export interface TeamCardProps {
    name: string;
    teamNumber: number;
    participants: User[];
}