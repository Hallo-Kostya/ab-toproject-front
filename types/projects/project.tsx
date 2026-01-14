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
}

export interface ProjectCardProps {
  name: string;
  description: string;
  teamsCnt?: number;
  placesCnt?: number;
}