export type Project = {
  id: string;
  name: string;
  description: string;
  goal: string;
  requirements: string;
  eval_criteria: string;
  semester: string;
  status: string;
  year: number;
  // Закомментировано, так как пока не реализовано в API
  // teamsCnt?: number;
  // placesCnt?: number;
  // teamsIds?: string[];
}

export interface ProjectCardProps {
  name: string;
  // Закомментировано, так как пока не реализовано в API
  // teamsCnt?: number;
  // placesCnt?: number;
}