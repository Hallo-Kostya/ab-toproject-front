export type Team = {
  id: string;
  name: string;
  group_link: string;
  number?: number;
  // Закомментировано, так как пока не реализовано в API
  // curator?: string;
  // team_artifacts?: string;
  // participantIds?: string[];
  // projectsIds?: string[];
}

export interface TeamStudent {
  id: string;
  first_name: string;
  last_name: string;
  patronymic?: string;
  role: string;
  study_group: string;
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
  // Закомментировано, так как пока не реализовано в API
  // participants?: Student[];
}