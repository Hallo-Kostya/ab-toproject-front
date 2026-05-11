// TODO: Check unusual ifaces

import { Student } from "../students/student";

export type Team = {
  id: string;
  name: string;
  group_link: string;
  number?: number;
  participantIds?: string[];
}

export interface TeamStudent {
  id: string;
  first_name: string;
  last_name: string;
  patronymic?: string;
  role?: string;
  study_group?: string;
}

export interface CreateTeamData {
  name: string;
  group_link: string;
}

export interface AddStudentToTeamData {
  student_id: string;
  role: string;
  study_group: string;
}

export interface TeamCardProps {
  id: string;
  name: string;
  teamNumber: number;
  studentCount: number;
  participants?: TeamStudent[];
}